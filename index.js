import express, { json } from 'express'
import mongoose, { mongo } from 'mongoose'
import fs from 'fs'
import { type } from 'os'


var concom = mongoose.createConnection('mongodb://username:password@communiditts_db:27017/miapp?authSource=admin')
var conuser = mongoose.createConnection('mongodb+srv://root:1234@cluster0.ymqxt.mongodb.net/userscomm?retryWrites=true&w=majority')
var contwiddit = mongoose.createConnection('mongodb+srv://root:1234@cluster0.ymqxt.mongodb.net/userscomm?retryWrites=true&w=majority')
var User = conuser.model("User",mongoose.Schema({userId:String}));
var Twiddit = contwiddit.model("Twiddit",mongoose.Schema({
  userId:{
    type: Number,
    required: true,
  },
  communidittId: Number,
  text: String,
  tags: [{type: String}]
}))

var Commun = new mongoose.Schema({
  communidittId:{
    type: Number
  },
  name: {
    type: String,
    required: true
  },
  aboutUs: {
    type: String,
    required: false
  },
  tags: [{
    type: String,
    required: false
  }],
  resources: {
    type: String,
    required: false
  },
  rules: {
    type: String,
    required: false
  },
  mods: [{
    type: String,
    required: true
  }],
  members: [{
    type: String,
    required: true
}]
},{
  timestamps: {createdAt: 'creationDate'}
});

var Communiditt = concom.model('Communiditt', Commun);
//autoincrement
const counterSchema={
  id:{
    type:String
  },
  seq:{
    type: Number
  }
}

const countermodel=concom.model("counter",counterSchema)

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: false}))

//listar comunidades
app.get('/communiditt', async (_req, res) => {
  console.log('listando communiditts....')
  const communiditts = await Communiditt.find();
  return res.json(communiditts)
})
//crear comunidad
app.post('/communiditt/create', async (_req, res) => {
  console.log('comprobando usuarios moderadores')
  const mods = _req.body.mods
  for (let i = 0; i < Object.keys(mods).length; i++) {
    const user = await User.findOne({userId:mods[i]});
    if(!user){return res.status(404).send('Uno o mas usuarios seleccionados para moderador no existen')};
  }
  var jsonAdd = _req.body;
  jsonAdd.members = jsonAdd.mods;
  
  countermodel.findOneAndUpdate(
    {id:"autoval"},
    {"$inc":{"seq":1}},
    {new:true},async(err,cd)=>{
      let seqId;
      if(cd==null){
        const newval = new countermodel({id:"autoval",seq:1})
        newval.save()
        seqId=1
      }else{
        seqId=cd.seq
      }
      jsonAdd.communidittId=seqId
      await Communiditt.create(jsonAdd)
    }
  )
  const countId = countermodel.find({id:"autoval"})
  //
  return res.send('ok')
})

//ver comunidad especifica
app.get('/communiditt/:id', async (_req, res) => {
  const communiditt = await Communiditt.findOne({communidittId:_req.params.id});
  if(communiditt===null){
    return res.status(404).send('La communiditt no existe')

  }else{
    console.log('mostrando communiditt', _req.params.id)
    return res.json(communiditt)
    
  }
})
//eliminar comunidad
app.delete('/communiditt/:id', async (_req, res) => {
  const communiditt = await Communiditt.findOne({communidittId:_req.params.id});
  if(communiditt===null){
    return res.status(404).send('La communiditt no existe')

  }else{
    console.log('eliminando communiditt', _req.params.id)
    await Communiditt.findOneAndDelete({communidittId:_req.params.id});
    return res.send('eliminada')
  }
})

//modificar comunidad
app.patch('/communiditt/:id/edit', async (_req, res) => {
  const communiditt = await Communiditt.findOne({communidittId:_req.params.id});
  if(communiditt===null){
    return res.status(404).send('La communiditt no existe')
  }
  console.log('editando communiditt', _req.params.id)
  var editJson = communiditt
  switch (_req.query.p){
    case 'name':
      editJson.name=_req.body.name;
      break;
    case 'aboutUs':
      editJson.aboutUs=_req.body.aboutUs;
      break;
    case 'tags':
      editJson.tags=_req.body.tags;
      break;
    case 'resources':
      editJson.resources=_req.body.resources;
      break;
    case 'rules':
      editJson.rules=_req.body;
      break;
    case 'mods':
      const mods = _req.body.mods
      for (let i = 0; i < Object.keys(mods).length; i++) {
        const user = await User.findOne({userId:mods[i]});
        if(!user){return res.status(404).send('Uno o mas usuarios seleccionados para moderador no existen')};
      }
      var auxArr=editJson.members.concat(mods)
      editJson.mods=mods;
      function removeDuplicates(arr) {
        return arr.filter((item,
            index) => arr.indexOf(item) === index);
      }
      editJson.members=removeDuplicates(auxArr)
      break;
    default:
      return res.status(404).send('La ruta de modificacion no existe')
  }
  await Communiditt.findOneAndUpdate({communidittId:_req.params.id},editJson)
  return res.send('actualizada')
})

//Unirse o retirarse de comunidad
app.patch('/communiditt/:idComm/:idUser', async (_req, res) => {

  const communiditt = await Communiditt.findOne({communidittId:_req.params.idComm});
  const user = await User.findOne({userId:_req.params.idUser});
  if(communiditt===null || user===null){
    return res.status(404).send('La communiditt o el usuario no existe')
  }
  var editJson = communiditt
  switch(_req.query.o){
    case 'add': 
      editJson.members.push(_req.params.idUser)
      const auxArr = editJson.members
      function removeDuplicates(arr) {
        return arr.filter((item,
            index) => arr.indexOf(item) === index);
      }
      editJson.members=removeDuplicates(auxArr)
      break;
    case 'remove':
      const index1 = editJson.members.indexOf(_req.params.idUser);
      editJson.members.splice(index1,1);
      const index2 = editJson.mods.indexOf(_req.params.idUser);
      editJson.mods.splice(index2,1);
      break;
    default:
      return res.status(404).send('La ruta de union a comunidad no existe')
  }
  await Communiditt.findOneAndUpdate({communidittId:_req.params.idComm},editJson)
  return res.send('guardado');
})

//feed y feed middleware
app.use("/communiditt/:id/feed", (req, res, next) => {
  if (!req.query.tags) {
      req.query.tags = "none";
  }
  next();
});

app.get('/communiditt/:id/feed', async (_req, res) => {
  try{
    //await Communiditt.findById(_req.params.id.trim());
  }catch(error){
    console.log(error)
    return res.status(404).send('La communiditt no existe')
  }
  if(_req.query.tags==="none"){
    console.log('none')
    const twiddits = await Twiddit.find({communidittId:_req.params.id});
    res.send(twiddits)
  }else{
    const twiddits = await Twiddit.find({communidittId:_req.params.id,tags:_req.query.tags});
    res.send(twiddits)
  }
  
})

app.use((_req, res) => {
  console.log("404 not found")
  return res.status(404).send('404 route not found')
})

app.listen(3001, () => console.log('listening...'))
