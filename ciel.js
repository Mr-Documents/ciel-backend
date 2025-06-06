const express = require('express');
const mongoose = require('mongoose');
const { Schema } = mongoose;
const cors = require('cors');
const bodyParser = require("body-parser");
require('dotenv').config();



const session = require("express-session");
const passport = require("passport");
const dotenv = require("dotenv");
require("./config/passport");
const authRoutes = require("./AuthRoute/authentication.mjs");


const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }));
const server = require('http').createServer(app);
const multer = require('multer');
//const io = require('socket.io')(server);
const path = require('path');
app.use('/files', express.static(path.join(__dirname, 'files')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'files/');
    },
    filename:(req,file,cb)=>{
      cb(null,file.originalname);
    }
    }
);
const upload = multer({ storage: storage });

//Sessions with cookies and the OAuth initializing code.

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes);

dotenv.config();


mongoose.connect(process.env.MONGO_URL);











//Models

  const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  bio: String,
  profile_pic: {type: String, default: ''},
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const collection = new mongoose.Schema({
  name: String,
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  ispublic:   Boolean,
  createdAt: { type: Date, default: Date.now }
})

const postSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: String,
  type: String,
  likes:[{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments:[{author:{ type: Schema.Types.ObjectId, ref: 'User' },content:String,likes:[{ type: Schema.Types.ObjectId, ref: 'User' }]}],
  author: { type: Schema.Types.ObjectId, ref: 'User' },
  tags:[String],
  createdAt: { type: Date, default: Date.now }
})

const chatSchema = new mongoose.Schema({
  owner:{ type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  messages: [{sender:{ type: Schema.Types.ObjectId, ref: 'User' },content:String}],
  createdAt: { type: Date, default: Date.now }
})

const forumSchema = new mongoose.Schema({
  name: String,
  description:String,
  owner:{ type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  topics:[String],
  createdAt: { type: Date, default: Date.now }
});

const forumtopicschema = new mongoose.Schema({
  name: String,
  description:String,
  forum:{ type: Schema.Types.ObjectId, ref: 'Forum' },
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  createdAt: { type: Date, default: Date.now }
});

const productschema = new mongoose.Schema({
  name: String,
  description: String,
  picture: String,
  price:Number,
  comments:[{author:{ type: Schema.Types.ObjectId, ref: 'User' },content:String,likes:[{ type: Schema.Types.ObjectId, ref: 'User' }]}],
  seller: { type: Schema.Types.ObjectId, ref: 'User' },
  tags:[String],
  quantity:Number,
  createdAt: { type: Date, default: Date.now }
})

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post',postSchema);
const Collection = mongoose.model('Collection',collection);
const Chat = mongoose.model('Chat',chatSchema);
const Forum = mongoose.model('Forum',forumSchema);
const ForumTopic = mongoose.model('ForumTopic',forumtopicschema);
const Product = mongoose.model('Product',productschema)











//Routes

app.use('/api/auth', router);

app.get('/', async (req, res) => {
  res.json({message:"hello backend"})
});

app.post('/signup',async (req,res)=>{
  const newUser = new User({
    name: req.body.name,
    password: req.body.password,
    bio:'',
    profile_pic:'Picture1.png'
  });

  await newUser.save();
  res.json(newUser)
})

app.post('/login',async (req,res)=>{
  const user = await User.findOne({name:req.body.name});
  if(user.password==req.body.password){
    res.json(user)
  }else{
    res("wrong password")
  }
 
})

app.post('/update_user/:id',upload.single('file'),async (req,res)=>{
  const user = await User.findByIdAndUpdate(req.params.id,{name:req.body.username,bio:req.body.bio,profile_pic:req.file.originalname});
})

app.get('/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).populate('author').populate({path:'comments', populate: {path: 'author'}}).exec();
  res.json(posts)
});

app.get('/posts/:authorId', async (req, res) => {
  const id = req.params.authorId;
  const posts = await Post.find({author:id});
  res.json(posts)
});

app.post('/create_post/:id',upload.single('file'),async (req,res)=>{
  const newPost = new Post({
    title: req.body.title,
    content: req.file?.originalname ?? 'none',
    description: req.body.description,
    type: req.body.type,
    author: req.params.id,
  });

  await newPost.save();
  res.json(newPost)
})

app.get('/post/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author').populate({path:'comments', populate: {path: 'author'}}).exec();
  res.json(post)
});

app.get('/user/:id', async (req,res)=>{
  const user = await User.findById(req.params.id);
  res.json(user)
})

app.post('/like/:id',async (req,res)=>{
  const post = await Post.findByIdAndUpdate(req.params.id,{ $push: { likes: { $each: [req.body.user] } } })
  res.json(post)
})

app.post('/comment/:id',async (req,res)=>{
  const comment = {author:req.body.user,content:req.body.message}
  const post = await Post.findByIdAndUpdate(req.params.id,{ $push: { comments: { $each: [comment] } } })
  res.json(post)
})

app.post('/delete/:id',async (req,res)=>{
  const post = await Post.findByIdAndDelete(req.params.id)
  res.json({message:'deleted'})
})

app.post('/followuser/:id',async (req,res)=>{
  const follower_id = mongoose.Types.ObjectId(req.body.id)
  const following_id = mongoose.Types.ObjectId(req.params.id)
  const follow = await User.findByIdAndUpdate(req.params.id,{ $push: { followers: { $each: [follower_id] } } })
  const following = await User.findByIdAndUpdate(req.body.user,{ $push: { following: { $each: [following_id] } } })
  res.json({message:`followed ${follow} and ${following}`})
})

app.post('/newchat', async (req,res)=>{
  const chat_room = new Chat({
    owner: req.body.user_id,
    members: [req.body.user_id, req.body.user_id_2]
  });
  await chat_room.save();
 res.json(chat_room)
})

app.get('/chats/:id',async(req,res)=>{
  const chats = await Chat.find({ members: req.params.id })
  .populate('owner')
  .populate('members');

  res.json(chats);
})

app.get('/chat/:id',async(req,res)=>{
  const chat = await Chat.findById(req.params.id).populate('owner').populate('members').populate({path:'messages', populate: {path: 'sender'}}).exec();
  res.json(chat)
})

app.post('/chat-message/:id', async (req,res)=>{
  const chat_room = await Chat.updateOne({ _id: req.params.id }, { $push: { messages: { $each: [req.body] } } });
  res.json({message:'message sent',data:chat_room})
})

app.post('/join_chat/:id',async(req,res)=>{
  const chat = await Chat.findByIdAndUpdate(req.params.id,{ $push: { members: { $each: [req.body.user] } } }).populate('owner').populate('members').populate({path:'messages', populate: {path: 'sender'}}).exec();
  res.json(chat)
})

app.post('/createforum',async(req,res)=>{
  const forum = new Forum({
    name: req.body.forum_name,
    description: req.body.description,
    owner: req.body.user,
    members:[req.body.user]
  })
  await forum.save()
  res.json(forum)
})

app.get('/myforums/:id',async(req,res)=>{
  const forums = await Forum.find({owner:req.params.id})
  res.json(forums)
})

app.get('/forumlist',async(req,res)=>{
  const forums = await Forum.find()
  res.json(forums)
})

app.get('/forum/:id',async(req,res)=>{
  const forum = await Forum.findById(req.params.id).populate('topics')
  const topics = await ForumTopic.find({forum:req.params.id}).populate('posts')
  res.json(topics)
})

app.post('/createtopic',async(req,res)=>{
  const topic = new ForumTopic({
    name: req.body.topic_name,
    description: req.body.description,
    forum: req.body.forum,
  })
  await topic.save()
  res.json(topic)
})

app.get('/topic/:id',async(req,res)=>{
  const topic = await ForumTopic.findById(req.params.id).populate('posts')
  res.json(topic)
})

app.post('/createforumpost',upload.single('file'),async (req,res)=>{
  console.log(req.body)
  const newPost = new Post({
    title: req.body.title,
    content: req.file?.originalname ?? 'none',
    description: req.body.description,
    type: req.body.type,
    author: req.body.user,
  });
  await newPost.save();
  const topic = await ForumTopic.findByIdAndUpdate(req.body.topic,{ $push: { posts: { $each: [newPost._id] } } })
  res.json(newPost,topic)
})

app.get('/products', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 }).populate('seller').populate({path:'comments', populate: {path: 'author'}}).exec();
  res.json(products)
});

app.get('/products/:id', async (req, res) => {
  const id = req.params.id;
  const products = await Product.find({seller:id});
  res.json(products)
});

app.get('/product/:id', async (req, res) => {
  const product = await Product.findOne({_id:req.params.id});
  res.json(product)
});

app.post('/create_product/:id',upload.single('file'),async (req,res)=>{
  const product = new Product({
    name: req.body.name,
    picture: req.file?.originalname ?? 'none',
    description: req.body.description,
    seller: req.params.id,
    price: req.body.price,
    quantity: req.body.quantity
  });

  await product.save();
  res.json(product)
})

app.post('/comment_product/:id',async (req,res)=>{
  const comment = {author:req.body.user,content:req.body.message}
  const product = await Product.findByIdAndUpdate(req.params.id,{ $push: { comments: { $each: [comment] } } })
  res.json(product)
})


server.listen(process.env.PORT, () => {
  console.log(`Server is running on ${process.env.PORT}`);
});