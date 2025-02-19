import userModel from "../models/userModel.js"

// add item to user cart
const addToCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = await userData.cartData;
        if(!cartData[req.body.itemId])
        {
            cartData[req.body.itemId] = 1
        }
        else{
            cartData[req.body.itemId] += 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Added To Cart"});
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})      
    }
}


// remove item from user cart
const removeFromCart = async (req,res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData;
        if (cartData[req.body.itemId]>0) {
            cartData[req.body.itemId] -= 1;
        }
        await userModel.findByIdAndUpdate(req.body.userId,{cartData});
        res.json({success:true,message:"Removed From Cart"})
    } catch (error) {
        console.log(error);
        res.jason({success:false,message:"Error"})
        
    }
}

// fetch user cart data
// const getCart = async (req,res) => {
//     try {
//         let userData = await userModel.findById(req.body.userId);
//         let cartData = await userData.cartData;
//         res.json({success:true,cartData})
//     } catch (error) {
//         console.log(error);
//         res.json({success:false,message:"Error"})
        
//     }
// }
const getCart = async (req, res) => {
    try {
      // Fetch the user by the provided userId (from token or request body)
      const userData = await userModel.findById(req.body.userId); // Or use req.user if authenticated
  
      // Check if the user exists
      if (!userData) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
  
      // Get the cart data (assuming `cartData` is stored in the user document)
      const cartData = userData.cartData || [];  // Default to an empty array if cartData is undefined
  
      // Return the cart data in the response
      res.json({ success: true, cartData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  

export {addToCart,removeFromCart,getCart}