function fail(error)
{
   console.log('error', error)
} function $(e, k){
   e = document.querySelectorAll(e);
   return typeof k == 'undefined' ? e : e[k];
}

function appHeight(){
    document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`)
}

const swipe = {
   startX:0,
   endX:0,
   direction(){
      
      if(swipe.endX > swipe.startX+40)
         d.slidein.hide();
   }
};

const kv = (o, k, v)=>Object.keys(o).find(key => o[key][k] === v);

async function f(url, data, s)
{
   const response = await fetch(url, {
      method: 'POST',
      
      body: JSON.stringify(data)
   });

   if(response.status == 429)
   {
      window.location.href = 'https://document.do/'+path+'?r='+encodeURIComponent(window.location.href);
      return;
   }

   if(response.status == 200)
   {
      const r = s.json ? await response.json() : await response.text();

      if(s.success.constructor.name == 'AsyncFunction')
         return await s.success(r);
      else
         return s.success(r);
   }

   if(s.error)
      return s.error();

   d.error.show();
}
const d = {contract:{
   
   id:'0xBdA842a879f3c8EB9aE389424999a71a84155a60',
   format:
   {
      content()
      {
         const content = draftarea.value == '' ? ' ' : draftarea.value;
         const hex = d.hex.encode(content);

         let hexLength = content.length.toString(16);

         let r = '0'.repeat(64-hexLength.length)+hexLength+hex;

         if(zero = ((hex.length/64) % 1)*64)
            r += '0'.repeat(64-zero);

         return r;
      },

      bytes32(str, pos)
      {
         let r = typeof str == 'string' ? d.hex.encode(str) : '0'.repeat(64);

         if(r.length < 64)
            r += '0'.repeat(64-r.length);

         return pos ? '0'.repeat(62)+'60'+r : r;
      }
   },

   editDocument()
   {
      const path = d.contract.format.bytes32(0, 1);

      d.web3.eth_sendTransaction({
         value:'0',
         methodID:'47c523e6',
         data:d.contract.format.bytes32(d.doc.name)+path+d.contract.format.content()
      });
   },

   buyDocument()
   {
      const referer = d.contract.format.bytes32(0, 1);

      d.web3.eth_sendTransaction({
         value:'0x'+parseInt(d.doc.price).toString(16),
         methodID:'f7e7ea67',
         data:d.contract.format.bytes32(d.doc.name)+referer+d.contract.format.content()
      });
   },

   async ownerDocument()
   {
      const address = await d.web3.rpc({
         "method": "eth_call",
         "params": [{
            "data": '0xb4d30d4a'+d.contract.format.bytes32(d.doc.name),
            "from": '0x0000000000000000000000000000000000000000',
            "to": d.contract.id
         },"latest"]
      });

      return '0x'+address.substr(-40);
   },

   async getDocument()
   {
      const response = await d.web3.rpc({
         "method": "eth_call",
         "params": [{
            "data": '0x1b48ba1f'+d.contract.format.bytes32(d.doc.name)+d.contract.format.bytes32(d.doc.path),
            "from": '0x0000000000000000000000000000000000000000',
            "to": d.contract.id
         },"latest"]
      });

      let l = response.substr(66,64).replace(/^[0]+/,'');
      if(l.length % 2) l = '0'+l;

      let content = response.substr(130, parseInt('0x'+l)*2);
      content = await d.hex.decode(content);

      d.doc.owned = parseInt(content.substr(0,1));
      content = content.substr(1);

      if(content == '')
      {
         if(d.doc.path)
            d.setInvalid(`Sub document not found. Try <a href="#${d.doc.name}">${d.doc.name}</a>.`);

         return;
      }

      d.doc.content = content;
   },

   async priceDocument()
   {
      let response = await d.web3.rpc({
         "method": "eth_call",
         "params": [{
            "data": '0xa28f74a2'+d.contract.format.bytes32(d.doc.name),
            "from": '0x0000000000000000000000000000000000000000',
            "to": d.contract.id
         },"latest"]
      });

      return parseInt(response.replace(/(?<=0x)[0]+/,''));
   }
},
crypt:
{
   sha: {},

   async SHA256(key){
      key = new TextEncoder().encode(key);
      key = await window.crypto.subtle.digest('SHA-256', key);
      d.crypt.sha.Uint8Array = new Uint8Array(key);
      return d.crypt.sha.str = d.hex.bytesToHex(d.crypt.sha.Uint8Array);
   },

   async en(key, text){
      const sha = await d.crypt.SHA256(key);
      d.crypt.text = text;
      d.crypt.iv = crypto.getRandomValues(new Uint8Array(16));
      await d.crypt.aes.encrypt();

      return d.crypt.crypted;
   },

   async de(){
      await d.crypt.aes.decrypt();
      return d.crypt.decrypted;
   },

   aes: {
      async encrypt(){
         await crypto.subtle.importKey("raw", d.crypt.sha.Uint8Array, "aes-cbc", false, ["encrypt"]).then(function(key)
         {
               return crypto.subtle.encrypt({
                     name: "aes-cbc",
                     iv:d.crypt.iv
                  },
                  key,
                  d.hex.stringToUTF8Bytes(d.crypt.text)
               );
         }, fail).then(function(text)
         {
               text = new Uint8Array(text);

               
               const bytes = new Uint8Array(d.crypt.iv.length + text.length);
               bytes.set(d.crypt.iv);
               bytes.set(text, d.crypt.iv.length);

               d.crypt.crypted = d.hex.bytesToHex(bytes);

         }, fail);
      },

      async decrypt()
      {
         await crypto.subtle.importKey("raw", d.hex.hexToBytes(d.crypt.sha.str), "aes-cbc", false, ["decrypt"]).then(function(key)
         {
            const encrypted = d.hex.hexToBytes(d.crypt.crypted);

            return crypto.subtle.decrypt({name: "aes-cbc", iv: (new Uint8Array(encrypted.buffer, 0, 16))}, key, (new Uint8Array(encrypted.buffer, 16)));
         }, fail).then(function(plainText)
         {
            
            d.crypt.decrypted = new TextDecoder().decode(plainText);

         }, fail);
      }
   }
},

   network: {
      id:137,
      name:'Polygon',
      ext:'pol',
      scan:'polygonscan.com',
      rpc:'https://rpc.ankr.com/polygon'
   },

   setInvalid(t){
      d.invalid = 1;

      error_.innerHTML = t ? t : `<strong>Invalid document name.</strong> Enter up to 32 characters (any except <span class="highlight">.#"'\\</span>)
      <div><span class="help_icon" onclick="d.nav.open()">?</span></div>`;
      document.body.setAttribute('class', 'error-body');
   },

   loading:(stop)=>{

      if(stop)
         return document.body.classList.remove('loading');

      document.body.classList.add('loading');
   },

   openHTML(){
      if(typeof dant != 'undefined')
      {
         if(dant.classList.contains('checkbox-checked'))
            localStorage.setItem(d.doc.address+'.open', 1);
         else
            localStorage.removeItem(d.doc.address+'.open');
      }

      d.open = ()=>0;
      document.write(d.doc.content);
   },

   async showContent(){
      if(d.doc.content.replaceAll(/\s/gm,''))
      {
         if(d.doc.content.match(/^<!DOCTYPE html>/i))
         {
            if(localStorage.getItem(d.doc.address+'.open'))
               return d.openHTML();

            dcontent_inner.innerHTML = `
               <div id="open_webpage">
                  <p>This document is a webpage. Do you want to open it?</p>
                  <div><span class="checkbox" id="dant" onclick="this.classList.toggle('checkbox-checked')">Dont ask next time</span></div>
                  <div><span class="button button-blue" onclick="d.openHTML()">Open document</span></div>
               </div>
            `;
         }
         else
            dcontent_inner.innerText = d.doc.content;
      }
      else
         dcontent_inner.innerHTML = '<em>This document is empty</em>';

      d.showDetails = ()=>{
         const published = ` document is published on <a href="https://${d.network.scan}/address/${d.contract.id}" target="_blank">${d.network.name}</a>`;
         const owned = d.doc.owned ? `This${published} and owned by <a onclick="d.revealOwner(this)">click to reveal</a>. Only the owner can control this document.` : `This unowned${published}. Anyone can apply changes or <a onclick="d.view.open('publish')">get the ownership</a>.`;
         d.slidein.open('Document information', 0, `<div id="dcontent_details">${owned}</div>`);
      }

      d.loading(1);
      d.view.body('dcontent');
   },

   async open()
   {
      if(d.slidein.locked)
         return;

      const raw = window.location.hash ? decodeURI(window.location.hash.substring(1)) : '';
      if(raw.match(/[A-Z]|^\s|\s$|[\s]{2}|\t/gm))
         return window.location = '#'+raw.toLowerCase().replaceAll(/[\s]+/g,' ').trim();

      d.loading();
      d.view.open('main', 'right');

      await d.name.parse();

      if(name_.value == '')
      {
         d.view.body('home');
         return d.loading(1);
      }

      d.show();
   },

   async show()
   {
      
         

      await d.contract.getDocument();

      if(d.invalid)
         return;

      if(!d.doc.owned)
      {
         d.doc.price = await d.contract.priceDocument();
         priceb.innerText = parseFloat(d.doc.price/1000000000000000000).toFixed(2).toString().replaceAll(/\.[0]+$|[0]+$/gm, '')+' MATIC';

         Array.from($('.docname')).forEach((e)=>{
            e.innerText = d.doc.name;
         });
      }

      if(d.doc.content != '')
         return d.showContent();

      return d.draft.open();
   },

   async revealOwner(e)
   {
      e.setAttribute('onclick', '');
      e.innerText = 'Loading...';
      const owner = await d.contract.ownerDocument();
      e.innerText = owner;
      e.setAttribute('href', `https://${d.network.scan}/address/${owner}`);
      e.setAttribute('target', `_blank`);
   },

   copy()
   {
      navigator.clipboard.writeText(window.location.href);
      share.classList.add('copied');
      setTimeout(()=>share.classList.remove('copied'), 2000);
   }
,
draft:{
   autosave:0,
   status:1,
   text:'',

   async open(){
      await d.draft.api(1);

      let txt = '';
      if(d.crypt.crypted)
         txt = await d.crypt.de();

      d.draft.textarea.set(txt);
      d.draft.lastSave = txt;

      d.loading(1);

      d.view.body('emptydraft draft');
   },

   publish(){
      d.view.open(!draftarea.value ? 'draft_empty' : 'publish_draft');
   },

   save()
   {
      if(d.draft.lastSave == d.draft.text)
         return;

      if(d.draft.status === 2)
         clearTimeout(d.draft.autosave);

      d.draft.status = 2;
      d.draft.autosave = setTimeout(d.draft.api, 2000);
   },

   async api(lookup)
   {
      const data = {k: await d.crypt.SHA256(d.doc.name)};

      if(!lookup)
      {
         document.body.classList.add('saving-draft');
         data.v = await d.crypt.en(d.doc.name, d.draft.text);
         d.draft.status = 3;
         d.draft.lastSave = d.draft.text;
      }
      else
         clearTimeout(d.draft.autosave);

      await f('https://document.do/draft/', data, {
            contentType:'text/plain',
            success:lookup ? (text)=>{d.crypt.crypted = text} : ()=>{d.draft.status = 1;document.body.classList.remove('saving-draft')},
            error:()=>d.error.show('Error while loading or saving the draft')
         }
      );
   },

   textarea:{
      change:(e)=>{
         if(d.draft.text == e.value)
            return;

         e.style.height = "5px";
         e.style.height = (e.scrollHeight+(e.scrollHeight > 50 ? 0 : 0))+"px";
         d.draft.text = e.value;
         d.draft.save();

         if(d.draft.text == '')
            document.body.classList.add('emptydraft');
         else
            document.body.classList.remove('emptydraft');
      },

      set:(v)=>{
         draftarea.value = v;
         setTimeout(()=>d.draft.textarea.change(draftarea),10);
      }
   }
},
error:{
   show(msg)
   {
      document_.insertAdjacentHTML('beforebegin', `
         <div id="apperror">
            <h1>An `+(msg ? '' : 'unknown ')+`error has occurred</h1>
            <p>`+(msg ? `Error details: ${msg}. ` : '')+`<strong>To avoid new errors you'll may have to refresh this page.</strong></p>
            <span class="button button-blanc" onclick="apperror.parentNode.removeChild(apperror)" style="color:#b31d1d;font-weight:600;">Close error</span>
            <span class="button button-black" onclick="location.reload()">Refresh</span>
         </div>
      `);
   }
},
help:{
   open()
   {
      d.slidein.open('Help','help', 0, {
         load:()=>{
            $('.help_qa').forEach((e)=>{

               e.insertAdjacentHTML('afterbegin',`<div class="help_close" onclick="this.parentNode.classList.remove('help_qa_open')">×</div>`);

               e.onclick = function (ev){
                  if(this.classList.contains('help_qa_open') || ev.target.classList.contains('help_close'))
                     return;

                  $('.help_qa').forEach(function(i){i.classList.remove('help_qa_open')});
                  this.classList.add('help_qa_open');
               }
            });
         }
      });
   },

   scroll()
   {
         pricetable.scrollTo({
           left: pricetable.scrollLeft + 50,
           behavior: "smooth",
        });
   },

   buyTerms()
   {
      d.slidein.open('Terms','buy_terms', 0, {
         load: ()=>{
            $('.sm-link').forEach(function(i){
               i.setAttribute('href', i.getAttribute('href')+d.contract.id)
            });
         }
      })
   }
},
hex:
{

   encode: (t)=>{
      return d.hex.bytesToHex(d.hex.stringToUTF8Bytes(t));
   },

   decode:(s)=>{
      return new TextDecoder().decode(d.hex.hexToBytes(s));
   },

   stringToUTF8Bytes:(t)=>{
      return new TextEncoder().encode(t);
   },

   bytesToHex:(bytes)=>{
      return Array.from(
      bytes,
      byte => byte.toString(16).padStart(2, "0")
      ).join("");
   },

   hexToBytes:(hex)=>{
      if (hex.length % 2 != 0)
          throw "Invalid hexString";

      const b = new Uint8Array(hex.length / 2);
      for (var i = 0; i < hex.length; i += 2) {
          byteValue = parseInt(hex.substr(i, 2), 16);
          if (byteValue == NaN)
             throw "Invalid hexString";
          b[i/2] = byteValue;
      }

      return b;
   }
},
name:{
   async parse()
   {
      d.invalid = 0;

      raw = window.location.hash ? decodeURI(window.location.hash.substring(1)) : '';

      if(name_.value != raw)
         name_.value = raw;

      d.doc = {
         name: '',
         network: '',
         content:'',
         owned:null,
         path: false
      };

      if(!raw)
         return d.name.empty();

      if(/^\//.test(raw))
         return d.setInvalid(`Document names can't start with <span class="highlight">\/<\/span>`);

      if(/[#\."'\\]/s.test(raw))
         return d.setInvalid();

      const p = raw.replace(/\/$/,'').split('/');
      const name = p[0];
      p.shift();

      d.doc.path = p.length ? p.join('/') : 0;

      if(p.length > 1)
         return d.setInvalid(`An document can only have one sub document (example/subname).`);

      d.doc.name = name;
   },

   setPath(t){
      t.shift();
      d.doc.path = t;
   },

   empty(){
      if(d.view.next && d.view.next.id != 'main')
         return d.view.open('main', 'right');

      d.loading(1);
      d.view.body('home');
   },

   change(){
      d.loading();

      if(window.dtypeout)
         clearTimeout(window.dtypeout);

      if(!name_.value)
      {
         return document.location.hash = '#';
      }

      window.dtypeout = setTimeout(()=>document.location.hash = '#'+name_.value, 500);
   }
},
slidein:{
   open:(title, page, html, s)=>{

      s = s ? s : {};

      if(d.slidein.locked)
         return;

      const opened = d.slidein.opened;

      d.slidein.opened = 1;

      if(opened)
         slidein_.scrollTo(0, 0);

      if(page)
         d.slidein.get(page, s);
      else if(html)
         slidein_content.innerHTML = html;

      document.body.classList.add('slidein_body');
      slidein_wrapper.style.display = 'block';
      slidein_title.innerHTML = title;

      if(s.class)
         slidein_wrapper.classList.add('si_'+s.class);

      if(opened)
         return;

      if(window.innerWidth > 1159)
      {
         slidein_.setAttribute('style', 'min-height:'+document_.offsetHeight+'px;margin-left:32px;');
      }
      else
         slidein_.setAttribute('style', `display:block;transition:right 0.2s;right:-${window.innerWidth}px`);

      setTimeout(()=>{
         slidein_wrapper.style.backgroundColor = 'rgba(0,0,0,0.1)';
         if(window.innerWidth < 1160)
            slidein_.style.right = (window.innerWidth > 500 ? 16 : 8)+'px';
      },20);

      window.scrollTo(0, 0);
   },

   async get(page, s){
      const r = await fetch('https://document.do/pages/'+page);
      slidein_content.innerHTML = await r.text();

      if(s.load)
         setTimeout(s.load, 100);
   },

   lock()
   {
      d.slidein.locked = 1;
      slidein_.style.marginLeft = '0px';
      slidein_.style.width = '1000px';
      slidein_close.style.display = 'none';
   },

   hide: function(){

      if(!document.body.classList.contains('slidein_body'))
         return;

      if(d.slidein.onHide)
      {
         d.slidein.onHide();
         d.slidein.onHide=0;
      }

      if(window.innerWidth > 1159)
         slidein_.style.marginLeft = '1000px';
      else
         slidein_.style.right = '-'+window.innerWidth+'px';

      slidein_wrapper.style.backgroundColor = 'rgba(0,0,0,0)';

      setTimeout(()=>{
         document.body.classList.remove('slidein_body');
         slidein_wrapper.setAttribute('style','');
         slidein_.setAttribute('style', '');
         slidein_content.innerHTML = slidein_title.innerHTML = '';
         slidein_wrapper.setAttribute('class','');
      },400);

      d.slidein.opened = 0;
   }
},
view:{

   body:(s)=>{
      document.body.setAttribute('class', s+'_body' + (document.body.classList.contains('loading') ? ' loading' : ''));
   },

   open:(next, direction)=>{

      if(d.slidein.opened)
      {
         d.slidein.hide();
         return setTimeout(()=>d.view.open(next, direction),500);
      }

      d.view.direction = direction ? direction : 'left';

      d.view.prev = d.view.next ? d.view.next : main;
      d.view.next = $('#'+next, 0);

      if(d.view.prev == d.view.next)
         return;

      const ww = window.innerWidth;
      const w = (ww > 1159 ? 1000 : ww)+'px';
      let h = window.innerHeight+'px';

      if(ww < 1160)
      {
         document.body.setAttribute('style', `height:${h};width:${w};overflow:hidden`);
         document_.style.height = h;
      }
      else
      {
         document_.setAttribute('style', `height:${document_.offsetHeight}px;overflow:hidden;`);
         h = 'auto';
      }

      const nw = (d.view.direction == 'right' ? '-' : '')+w;
      d.view.next.setAttribute('style', `position:absolute;display:block;height:${h};width:${w};left:${nw};transition:left 0.5s`);
      d.view.prev.setAttribute('style', `display:block;height:${h};width:${w};left:0px;position:absolute;transition:left 0.5s`);

      setTimeout(()=>{
         d.view.prev.style.left = (d.view.direction == 'left' ? '-' : '')+window.innerWidth+'px';
         d.view.next.style.left = '0px';
         document_.style.height = d.view.next.offsetHeight+'px';
         setTimeout(()=>{
            if(d.view.prev.id.substr(0,3) == 'tmp')
               d.view.prev.parentNode.removeChild(d.view.prev);
            else
               d.view.prev.style.display = 'none';
            d.view.next.setAttribute('style', 'display:block');
            document.body.setAttribute('style', '');
            document_.setAttribute('style', '');
         },600);
      },50);
   },

   tmp:(c, h)=>{
      const id = 'tmp'+Date.now();
      main.insertAdjacentHTML('afterend', `<div id="${id}" class="clear ${c}">${h}</div>`);
      return d.view.open(id);
   }
},
web3:

{
   chainID:0,
   account:[],

   load ()
   {
      const e = window.ethereum;

      if(!e)
         return;

      e.on('chainChanged', (id)=>{
         d.web3.chainID = id;
         d.web3.isPolygon();
      });
      e.on('connect', (i)=> {
         d.web3.chainID = i.chainId
      });
      e.on('disconnect', ()=> d.web3.chainID = 0);
      e.on('accountsChanged', (account)=>{
         d.web3.account = account;
      });
   },

   isPolygon()
   {
      if(parseInt(d.web3.chainID) === d.network.id)
         return d.web3.sendTransaction();

      d.view.tmp('publish supported_chains', `
         <div class="view_back" onclick="d.view.open('publish', 'right')"></div>
         <p>You need to select the ${d.network.name} network in your wallet.</p>
      `);
   },

   sendTransaction()
   {
      if(typeof d.web3.transaction == 'function')
         d.web3.transaction();
   },

   async connect(f)
   {
      if(!window.ethereum && !window.ethereum.isConnected())
         return d.view.tmp('publish', `<div class="view_back" onclick="d.view.open('main', 'right')"></div>To publish a document you'll need a dapp browser like <a href="https://metamask.io/" target="_blank">MetaMask</a>, <a href="https://www.opera.com/crypto/next" target="_blank">Opera</a>.`);

      if(d.web3.account.length)
         return d.web3.isPolygon();

      d.slidein.open('<div class="loadingg"></div><div class="cwaiting">Waiting for you to connect your wallet...</div>', 0);

      window.ethereum.request({method: 'eth_requestAccounts'}).then((account) => {
         d.web3.account = account;
         window.setTimeout(d.web3.isPolygon, 500);
      }).catch((error) => {
         d.slidein.hide();
      });
   },

   async eth_sendTransaction(s)
   {
      if(d.web3.transaction)
         return;

      d.web3.transaction = function(){

         d.slidein.open('<div class="loadingg"></div><div class="cwaiting">Waiting for you to confirm the transaction...</div>', 0);

         const params = [{
             from: d.web3.account[0],
             to: d.contract.id,
             value: s.value,
             data:`0x${s.methodID}${s.data}`
          }];

         window.ethereum.request({
               method: 'eth_sendTransaction',
               params
            })
            .then((result) => {
               d.view.tmp('publish published', `
                  <h2>Publishing on ${d.network.name}</h2>
                  <p id="published_text">After the <a href="http://${d.network.scan}/tx/${result}" target="_blank">transaction</a> is completed you can view the document here:</br><a onclick="window.location.reload(true)">document.do#${d.doc.name}</a></p>
               `);
            })
            .catch((error) => {

               
               if(error.code == 4001)
                  return d.slidein.hide();

               console.log('error', error);
         });

         delete d.web3.transaction;
      };

      d.web3.connect();
   },

   async rpc(o)
   {
      const response = await fetch(d.network.rpc, {
         method: "POST",
         headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
         },
         body: JSON.stringify({
            jsonrpc: "2.0",
            method: (o.method ? o.method : 'eth_getTransactionByHash'),
            id:1,
            params:(o.params ? o.params : [])
         })
      });

      const json = await response.json();

      if(json.error)
      {
         console.log(json.error);
         return null;
      }

      if(json.result)
         return o.k ? json.result[o.k] : json.result;

      return;
   }
}};window.onload = function()
{
   d.open();

   document.body.addEventListener("keyup", (e) => {
      if (e.key === "Escape")
         d.slidein.hide();
   });

   slidein_wrapper.addEventListener("click", function (e){
      if(e.target === e.currentTarget)
         d.slidein.hide();
   });

   appHeight();

   d.web3.load();

   document_.insertAdjacentHTML('afterend',`<div class="nav">${nav.innerHTML}</div>`);
};

window.addEventListener('hashchange', d.open);

document.addEventListener('touchstart', e => {
  swipe.startX = e.changedTouches[0].screenX
});
document.addEventListener('touchend', e => {
  swipe.endX = e.changedTouches[0].screenX;
  swipe.direction();
});

window.addEventListener('resize', appHeight);