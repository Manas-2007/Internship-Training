const RecentlyViewed = require('../models/RecentlyViewed');

exports.syncRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { localItems = [] } = req.body;

    // Fetch or initialize user history
    let userHistory = await RecentlyViewed.findOne({ user: userId });
    if (!userHistory) {
      userHistory = new RecentlyViewed({ user: userId, items: [] });
    }

    // Use Map to merge and remove duplicates
    const mergedMap = new Map();

    // Add existing DB items
    userHistory.items.forEach(item => {
      mergedMap.set(item.product.toString(), new Date(item.viewedAt).getTime());
    });

    // Merge local items (keep the latest timestamp)
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

    // Convert to array, sort by newest, and limit to 20 items
    const mergedArray = Array.from(mergedMap, ([product, viewedAt]) => ({
      product,
      viewedAt
    }))
      .sort((a, b) => b.viewedAt - a.viewedAt)
      .slice(0, 20);

    // Save updated list to DB
    userHistory.items = mergedArray;
    await userHistory.save();

    // Populate product details for the frontend
    await userHistory.populate('items.product');

    // Format response as a flat array
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