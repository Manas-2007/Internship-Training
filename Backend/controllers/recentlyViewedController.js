const RecentlyViewed = require('../models/RecentlyViewed');
const Product = require('../models/Product'); 
const Wishlist = require('../models/Wishlist'); 

exports.syncRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { localItems = [] } = req.body;

    let userHistory = await RecentlyViewed.findOne({ user: userId });
    if (!userHistory) {
      userHistory = new RecentlyViewed({ user: userId, items: [] });
    }

    const mergedMap = new Map();

    userHistory.items.forEach(item => {
      mergedMap.set(item.product.toString(), new Date(item.viewedAt).getTime());
    });

    localItems.forEach(item => {
      const prodId = item._id ? item._id.toString() : null;
      if (prodId) {
        const localTime = item.viewedAt ? new Date(item.viewedAt).getTime() : Date.now();
        const existingTime = mergedMap.get(prodId);
        
        if (!existingTime || localTime > existingTime) {
          mergedMap.set(prodId, localTime);
        }
      }
    });

    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const cutoffTime = Date.now() - THIRTY_DAYS;

    const mergedArray = Array.from(mergedMap, ([product, viewedAt]) => ({
      product,
      viewedAt
    }))
      .filter(item => item.viewedAt > cutoffTime) 
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, 50); 

    userHistory.items = mergedArray;
    await userHistory.save();
    await userHistory.populate('items.product');

    const responseItems = userHistory.items
      .filter(item => item.product !== null)
      .map(item => ({
        ...item.product._doc,
        viewedAt: item.viewedAt
      }));

    res.status(200).json(responseItems);

  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Server error during sync" });
  }
};

// RECOMMENDATION ENGINE 
exports.getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const [history, userWishlist] = await Promise.all([
            RecentlyViewed.findOne({ user: userId }).populate('items.product'),
            Wishlist.findOne({ userId: userId }).populate('products') 
        ]);
        
        let recommendedProducts = [];
        const viewedProductIds = history ? history.items.map(item => item.product?._id).filter(Boolean) : [];
        const wishlistedProductIds = userWishlist ? userWishlist.products.map(p => p?._id).filter(Boolean) : [];
        
        let combinedCategories = new Set();
        if (history) history.items.forEach(item => item.product?.category && combinedCategories.add(item.product.category));
        if (userWishlist) userWishlist.products.forEach(p => p?.category && combinedCategories.add(p.category));
        
        const categories = [...combinedCategories];
        const excludeIds = [...new Set([...viewedProductIds, ...wishlistedProductIds])];

        if (categories.length > 0) {
            recommendedProducts = await Product.aggregate([
                { $match: { 
                    category: { $in: categories }, 
                    _id: { $nin: excludeIds } 
                }},
                { $sort: { price: -1, createdAt: -1 } }, 
                { $limit: 10 }
            ]);
        }

        if (recommendedProducts.length < 5) {
            const alreadyRecommendedIds = recommendedProducts.map(p => p._id);
            const finalExcludeList = [...excludeIds, ...alreadyRecommendedIds];

            const popularFallback = await Product.aggregate([
                { $match: { _id: { $nin: finalExcludeList } } },
                { $sort: { price: -1 } }, 
                { $limit: 10 - recommendedProducts.length }
            ]);
            
            recommendedProducts = [...recommendedProducts, ...popularFallback];
        }

        res.status(200).json({ success: true, recommendations: recommendedProducts });
        
    } catch (error) {
        console.error("Recommendation Engine Error:", error);
        res.status(500).json({ message: "Error fetching recommendations" });
    }
};