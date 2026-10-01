import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
app.use(cors());
app.use(express.json());

const products = [
  { sku:'SHOE-42', name:'Running Shoe', variant:'Black / 42', category:'Footwear', location:'A-04-12', main:12, physical:12, secondary:8 },
  { sku:'SHIRT-M', name:'Cotton Shirt', variant:'Blue / M', category:'Apparel', location:'B-02-08', main:8, physical:7, secondary:14 },
  { sku:'BAG-01', name:'Laptop Bag', variant:'Black', category:'Bags', location:'C-01-03', main:5, physical:5, secondary:0 },
  { sku:'WATCH-2', name:'Smart Watch', variant:'Graphite', category:'Electronics', location:'D-03-05', main:4, physical:2, secondary:6 },
  { sku:'BOTTLE-1', name:'Steel Bottle', variant:'750ml', category:'Lifestyle', location:'E-02-04', main:22, physical:22, secondary:10 }
];

let orders = Array.from({length: 32}, (_, i) => {
  const id = String(10450 + i);
  const priority = [2,5,8,11,14,17,20,23,26,29].includes(i);
  const statuses = ['shipped','staged','packing','picking','ready_to_pick','processing'];
  const status = i < 8 ? 'shipped' : statuses[i % statuses.length];
  const sku = products[i % products.length].sku;
  const qty = sku === 'SHIRT-M' && i === 32 ? 2 : (i % 3 === 0 ? 2 : 1);
  return { id, customer:['Rahul Sharma','Priya Mehta','Arjun Singh','Neha Kapoor'][i%4], channel:['Amazon','Shopify','Flipkart'][i%3], priority, status, sku, qty, courier:['Delhivery','BlueDart','Xpressbees'][i%3], shipBy: priority ? '14:00' : '18:00', tracking: status==='shipped' ? `TRK${id}` : null, staging: status==='staged' ? `A${(i%6)+1}` : null };
});
orders[3] = {...orders[3], status:'picking', sku:'SHIRT-M', qty:2};
orders[10] = {...orders[10], status:'staged', staging:null};
orders[12] = {...orders[12], status:'packing', priority:true};
orders[16] = {...orders[16], status:'picking', sku:'WATCH-2', qty:3};

let exceptions = [
  {id:'EX-204', orderId:'10453', type:'Inventory Missing', severity:'high', description:'Expected 2 × SHIRT-M; picker found only 1.', status:'open', owner:'Warehouse'},
  {id:'EX-205', orderId:'10460', type:'Missing Staging Location', severity:'high', description:'Packed box has no recorded staging location.', status:'open', owner:'Warehouse'},
  {id:'EX-206', orderId:'10462', type:'Priority Order At Risk', severity:'medium', description:'Priority order is still in packing close to the ship-by time.', status:'open', owner:'Office'},
  {id:'EX-207', orderId:'10466', type:'Inventory Missing', severity:'high', description:'System shows 4 × WATCH-2 but only 2 were physically found.', status:'open', owner:'Warehouse'}
];

const summary = () => ({
  total: orders.length,
  priority: orders.filter(o=>o.priority && o.status!=='shipped').length,
  atRisk: orders.filter(o=>o.priority && !['shipped','staged'].includes(o.status)).length,
  exceptions: exceptions.filter(e=>e.status==='open').length,
  statusCounts: ['processing','ready_to_pick','picking','packing','staged','shipped'].map(status=>({status,count:orders.filter(o=>o.status===status).length}))
});

app.get('/api/health', (_,res)=>res.json({ok:true}));
app.get('/api/dashboard', (_,res)=>res.json({summary:summary(), attention: orders.filter(o=>o.priority && !['shipped','staged'].includes(o.status)).slice(0,6), exceptions:exceptions.filter(e=>e.status==='open')}));
app.get('/api/orders', (req,res)=>{
  let result=[...orders];
  if(req.query.status) result=result.filter(o=>o.status===req.query.status);
  if(req.query.priority==='true') result=result.filter(o=>o.priority);
  if(req.query.q) result=result.filter(o=>`${o.id} ${o.customer} ${o.sku}`.toLowerCase().includes(req.query.q.toLowerCase()));
  res.json(result);
});
app.get('/api/orders/:id',(req,res)=>{
  const order=orders.find(o=>o.id===req.params.id); if(!order) return res.status(404).json({message:'Order not found'});
  const product=products.find(p=>p.sku===order.sku);
  res.json({...order, product, timeline:[['Order received','09:14'],['Processed','09:17'],['Label created','09:18'],[order.status==='picking'?'Picking':'Current status','09:42']]});
});
app.patch('/api/orders/:id',(req,res)=>{
  const order=orders.find(o=>o.id===req.params.id); if(!order) return res.status(404).json({message:'Order not found'});
  if(req.body.status) order.status=req.body.status;
  if(req.body.staging!==undefined) order.staging=req.body.staging;
  if(order.status==='shipped') order.tracking ||= `TRK${order.id}`;
  res.json(order);
});
app.get('/api/inventory', (_,res)=>res.json(products));
app.patch('/api/inventory/:sku',(req,res)=>{const p=products.find(x=>x.sku===req.params.sku); if(!p)return res.status(404).json({message:'SKU not found'}); if(req.body.physical!==undefined)p.physical=Number(req.body.physical); res.json(p);});
app.get('/api/exceptions', (_,res)=>res.json(exceptions));
app.patch('/api/exceptions/:id',(req,res)=>{const e=exceptions.find(x=>x.id===req.params.id);if(!e)return res.status(404).json({message:'Exception not found'}); if(req.body.status)e.status=req.body.status;res.json(e);});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`XYZ API running on port ${PORT}`));
