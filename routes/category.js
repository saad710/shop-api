const router = require("express").Router()
const {
    verifyToken,
    verifyTokenAndAuthorization,
    verifyTokenAndAdmin,
  } = require("../middleware/verifyToken");

const Category = require("../models/Category");


router.post('/', verifyTokenAndAdmin, async (req,res)=> {
    const {name} = req.body
    const newCategory = new Category({
        name : name
    })
    try{
        const savedCategory = await newCategory.save()
        res.status(200).json(savedCategory)
    }
    catch(err){
        res.status(500).json(err)
    }
})

router.put('/:id', verifyTokenAndAdmin, async (req,res)=> {
  try{
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, {
        $set:req.body
    }, {new: true}
    )
    res.status(200).json(updatedCategory)
  }
  catch(err){
    res.status(500).json(err)
  }
})

router.delete('/:id', verifyTokenAndAdmin, async (req,res)=> {
  const categoryId = req.params.id
  try{
    const deletedCategory = await Category.findByIdAndDelete(categoryId)
    res.status(200).json("successfully deleted")
  }
  catch(err){
    res.status(500).json(err)
  }

})

module.exports = router;