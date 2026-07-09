const RecentlyViewed = require('../models/RecentlyViewed');

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

    const mergedArray = Array.from(mergedMap, ([product, viewedAt]) => ({
      product,
      viewedAt
    }))
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, 20);

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