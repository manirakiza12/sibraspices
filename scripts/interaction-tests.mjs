import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
class Element {
 constructor(){this.attributes={};this.events={};this.hidden=false;this.value='';this.textContent='';this.classes=new Set();this.dataset={};this.classList={toggle:(name,on)=>on?this.classes.add(name):this.classes.delete(name)};}
 setAttribute(k,v){this.attributes[k]=String(v);}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
 emit(name,event={}){for(const fn of this.events[name]||[])fn({target:this,preventDefault(){},...event});}
 contains(){return false;} matches(){return false;} closest(){return null;} focus(){}
 querySelector(){return this.marker;}
 setCustomValidity(value){this.validation=value;} reportValidity(){return !this.validation;}
}
const selectors=['#year','#mobile-nav','#menu-toggle','#hero','#slide-count','#pause-slider','#prev-slide','#next-slide','#filter-status','#service','#phone','#booking-form','#booking-status'];
const els=Object.fromEntries(selectors.map(s=>[s,new Element()]));els['#mobile-nav'].hidden=true;
const slides=Array.from({length:3},()=>new Element());
const dots=Array.from({length:3},()=>{const e=new Element();e.marker=new Element();return e;});
const filters=['All spices','Whole spices','Botanicals','Seeds & staples'].map(category=>{const e=new Element();e.dataset.filter=category;return e;});
const cards=['Whole spices','Whole spices','Botanicals','Seeds & staples'].map(category=>{const e=new Element();e.dataset.category=category;return e;});
const service=new Element();service.dataset.service='Wholesale Supply';
const list={'.hero-slide':slides,'.slide-dot':dots,'.product-filter':filters,'.product-card':cards,'[data-service]':[service],'#mobile-nav a':[]};
const outgoing=[];let interval;
const media={matches:false,addEventListener(){}};
const document={querySelector:s=>els[s],querySelectorAll:s=>list[s]||[],hidden:false,activeElement:null,addEventListener(){},createElement:()=>({click(){outgoing.push(this.href);}})};
const context={document,window:{matchMedia:()=>media},Date,FormData:class extends Map{constructor(form){super(Object.entries(form.values));}},setInterval:fn=>{interval=fn;return 1;},clearInterval(){},requestAnimationFrame:fn=>fn(),encodeURIComponent};
vm.runInNewContext(fs.readFileSync('main.js','utf8'),context);
assert.equal(els['#year'].textContent,new Date().getFullYear());
// Wraparound, direct selection, accessible inactive slides, and playback state.
els['#next-slide'].emit('click');assert.equal(els['#slide-count'].textContent,'02 / 03');assert.equal(slides[1].inert,false);assert.equal(slides[0].attributes['aria-hidden'],'true');
els['#prev-slide'].emit('click');els['#prev-slide'].emit('click');assert.equal(els['#slide-count'].textContent,'03 / 03');
dots[0].emit('click');assert.equal(dots[0].attributes['aria-current'],'true');assert.equal(els['#slide-count'].textContent,'01 / 03');
els['#pause-slider'].emit('click');assert.equal(els['#pause-slider'].attributes['aria-pressed'],'true');
// Touch swipe navigation does not intercept vertical scrolling.
els['#hero'].emit('touchstart',{touches:[{clientX:250,clientY:10}]});els['#hero'].emit('touchend',{changedTouches:[{clientX:100,clientY:20}]});assert.equal(els['#slide-count'].textContent,'02 / 03');
// Product filters select the intended catalogue subset.
filters[2].emit('click');assert.deepEqual(cards.map(c=>c.hidden),[true,true,false,true]);filters[0].emit('click');assert(cards.every(c=>!c.hidden));
// Navigation toggles and service CTAs respond without a backend.
els['#menu-toggle'].emit('click');assert.equal(els['#mobile-nav'].hidden,false);els['#menu-toggle'].emit('click');assert.equal(els['#mobile-nav'].hidden,true);
service.emit('click');assert.equal(els['#service'].value,'Wholesale Supply');
// Invalid numbers cannot produce an inquiry; valid submissions encode the exact details once.
const form=els['#booking-form'];form.values={name:'Amina & Co',phone:'123',location:'Kampala',service:'Wholesale Supply',message:'Cardamom 5 kg'};
form.emit('submit',{currentTarget:form});assert.equal(outgoing.length,0);assert(els['#phone'].validation);
els['#phone'].emit('input');form.values.phone='0772 123456';form.emit('submit',{currentTarget:form});assert.equal(outgoing.length,1);
const url=new URL(outgoing[0]);assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/256763415857');const text=url.searchParams.get('text');assert(text.includes('Amina & Co'));assert(text.includes('Cardamom 5 kg'));assert(text.includes('0772 123456'));assert.equal((text.match(/Cardamom 5 kg/g)||[]).length,1);
console.log('Interaction checks passed: carousel, swipe, pause, filters, mobile menu, service selection, phone validation, and WhatsApp request encoding.');
