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

      return s.success(r);
   }

   if(s.error)
      return s.error();

   d.error.show();
}
const d = {address:{
   async set(raw, checkName){

      let dotsplit = raw.split('.');
      const address = dotsplit[0];

      if((address.length < 33 && dotsplit.length > 1) || dotsplit.length > 2 || (dotsplit.length > 1 && ['pol', 'sol', 'eth'].indexOf(dotsplit[1]) == -1))
         return d.setInvalid();

      if(dotsplit.length > 1)
      {
         d.doc.network = dotsplit[1];

         if(['eth', 'pol'].indexOf(d.doc.network) != -1 && /^0x([A-Fa-f0-9]{64})$/.test(address))
            d.doc.address = address;
         else
            return d.setInvalid();
      }
      else if(checkName)
         await d.address.byName(raw);
   },

   async byName(name){

      d.doc.name = name;
      d.doc.nameHash = await d.crypt.SHA256('document.do'+name);
      name = d.hex.encode(name);
      if(name.length < 64)
         name = name+'0'.repeat(64-name.length);

      

      const response = await fetch(d.network().rpc,
      {
         method: "POST",
         headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
         },
         body: JSON.stringify({
            "id": 1,
            "jsonrpc": "2.0",
            "method": "eth_call",
            "params": [{
               "data": '0x20c38e2b'+name,
               "from": '0x0000000000000000000000000000000000000000',
               "to": d.contract
            },"latest"
            ]}
         )
      });

      const result = await response.json();
      const owner = result.result.substr(26,40);

      if(owner == '0'.repeat(40))
      {
         if(d.doc.path)
            d.setInvalid(`Document not found. Remove all <span class="highlight">\/<\/span> to open a draft.`);

         return;
      }

      d.doc.owner = owner;
      
      let content = result.result.substr(194).replace(/[0]+$/,'');

      if(content.length % 2)
         content = content+'0';

      d.doc.content = d.hex.decode(content);

      await d.address.set(d.doc.content);

      if(!d.doc.network)
         d.doc.network = 'Polygon';
   },
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

      async decrypt(encrypted)
      {
         await crypto.subtle.importKey("raw", d.hex.hexToBytes(d.crypt.sha.str), "aes-cbc", false, ["decrypt"]).then(function(key)
         {
            const encrypted = d.hex.hexToBytes(d.crypt.crypted);

            return crypto.subtle.decrypt({name: "aes-cbc", iv: (new Uint8Array(encrypted.buffer, 0, 16))}, key, (new Uint8Array(encrypted.buffer, 16)));
         }, fail).then(function(plainText)
         {
            d.crypt.decrypted = String.fromCharCode.apply(null, new Uint8Array(plainText));
            

         }, fail);
      }
   }
},

   contract:'0x98791798c1ca740e3e7bc0debeea382717bf5cd3',

   setInvalid:(t)=>{
      d.invalid = 1;

      if(d.doc.owner)
         return;

      error_.innerHTML = t ? t : `<strong>Invalid document name.</strong>
      <br>- Enter up to 32 characters (any except <span class="highlight">.#</span>)
      <br>- Or enter a transaction hash with type like <span class="highlight">0x000~.eth</span>
      <div><span class="help_icon" onclick="d.nav.open()">?</span></div>`;
      document.body.setAttribute('class', 'error-body');
   },

   loading:(stop)=>{

      if(stop)
         return document.body.classList.remove('loading');

      document.body.classList.add('loading');
   },

   

   openHTML:()=>{
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

   showContent:()=>{
      if(d.doc.content)
      {
         d.doc.content = d.doc.content.replace(/^\u0000/,'');

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

      d.doc.showDetails = ()=>{

         const html = d.doc.name ? `
            <strong>Owner</strong> <a href="https://${d.network('pol').scan}/address/0x${d.doc.owner}" target="_blank">0x${d.doc.owner}</a><br/>
            <strong>Source</strong> <a href="https://${d.network('pol').scan}/address/${d.contract}" target="_blank">${d.network('pol').name}</a>`
            :
            `<strong>Source</strong> <a href="https://${d.network().scan}/tx/${d.doc.address}" target="_blank">${d.network().name}</a>`;

         d.slidein.open('Document details', 0, `<div id="dcontent_details">${html}</div>`);
      }

      d.loading(1);
      d.view.body('dcontent');
   },

   network:(nk)=>d.web3.network_data[kv(d.web3.network_data, 'ext', (nk ? nk : (d.doc.network ? d.doc.network : 'pol')))],

   async transaction()
   {
      if(cache = localStorage.getItem(d.doc.address))
      {
         cache = JSON.parse(cache);
         d.doc.owner = cache.owner;
         d.doc.content = cache.content;
         return true;
      }

      const result = await d.web3.rpc({
         params:d.doc.address
      });

      if(result === null)
      {
         error_.innerHTML = `There was a error loading this document. We'll try again in a couple of seconds.`;
         document.body.setAttribute('class', 'error-body');
         return;
      }

      if(!result)
      {
         error_.innerHTML = `Document not found. Visit <a href="https://${d.network().scan}/tx/${d.doc.address}" target="_blank">${d.network().scan}</a> to find the transaction status.`;
         document.body.setAttribute('class', 'error-body');
         return;
      }

      

      d.doc.owner = result.from;
      d.doc.content = d.hex.decode(result.input);
      localStorage.setItem(d.doc.address, JSON.stringify(d.doc));

      return true;
   },

   async open()
   {
      if(d.slidein.locked)
         return;

      d.loading();
      d.view.open('main', 'right');

      await d.name.parse();

      if(name_.value == '')
      {
         d.view.body('home');
         return d.loading(1);
      }

      if(!d.doc.address && d.doc.owner)
         return d.showContent();

      if(d.invalid)
         return;

      if(!d.doc.address)
         return d.draft.open();

      if(await d.transaction())
         d.showContent();
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
               i.setAttribute('href', i.getAttribute('href')+d.contract)
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
   async parse(){
      let raw = window.location.hash ? decodeURI(window.location.hash.substring(1)).toLowerCase().trim() : '';
      d.invalid = 0;
      d.doc = {
         name: '',
         address: '',
         network: '',
         path: 0,
         owner:0
      };

      if(name_.value != raw)
         name_.value = raw;

      if(!raw)
         return d.name.empty();

      if(/^\//.test(raw))
         return d.setInvalid(`Document names can't start with <span class="highlight">\/<\/span>`);

      if(/#/s.test(raw))
         return d.setInvalid();

      const p = raw.split('/');
      const name = p[0];
      p.shift();
      d.doc.path = p.length ? p : 0;

      await d.address.set(name, 1);

      d.doc.price = d.name.price();
      priceb.innerText = '$'+d.doc.price;

      Array.from($('.docname')).forEach((e)=>{
         e.innerText = d.doc.name;
      });
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
   },

   price()
   {
      const n = d.doc.name;
      const l = n.length;

      if(l > 10)
         return 5;

      const t = n.match(/^[a-z]+$/) ? 1 : ( n.match(/^[0-9]+$/) ? 2 : ( n.match(/^[^0-9a-z]+$/i) ? 3 : 4 ) );

      if(l === 1)
      {
         if(t === 1)
            return 4500;

         if(t === 2)
            return 4000;

         if(t === 3)
            return 3000;
      }

      if(l === 2)
      {
         if(t === 1)
            return 2500;

         if(t === 2)
            return 500;

         return 200;
      }

      if(l === 3)
      {
         if(t === 1)
            return 1500;

         return 50;
      }

      if(l === 4)
      {
         if(t === 1)
            return 900;

         return 30;
      }

      if(l === 5)
      {
         if(t === 1)
            return 500;

         return 20;
      }

      if(l > 5 && l < 8)
      {
         if(t === 1)
            return 100;

         return 20;
      }

      return 15;
   }
},
publish:{
   confirm()
   {
      if(window.ethereum && d.web3.account.length)
      {
         if(d.publish.eth.payment)
         {
            if(parseInt(d.web3.chainID) !== parseInt(kv(d.web3.network_data, 'ext', 'eth')))
            {
               return d.slidein.open('Buy with Ether', 0, 'Select the Ethereum network in your wallet.', 'btc_payment');
            }

            return d.publish.eth.request();
         }

         if(draftarea.value == '')
            return d.view.tmp('publish draft_empty', `<div class="view_back" onclick="d.view.open('main', 'right')"></div><h2>You can't publish a empty draft.</h2>`);

         if(!Object.keys(d.web3.network_data).includes(parseInt(d.web3.chainID).toString()))
         {
            return d.view.tmp('publish supported_chains', `
               <div class="view_back" onclick="d.view.open('main', 'right')"></div>
               <p>At the moment document.do supports Polygon and Ethereum.<br> Choose one of those networks in MetaMask.</p>
               <p>Or accept the <a onclick="d.slidein.open('help')">disadvantages</a> of using a unsupported network and <a onclick="d.publish.viewConfirm()">continue</a>.</p>
            `);
         }

         return d.publish.viewConfirm();
      }

      d.web3.connect();
   },

   viewConfirm()
   {
      const network = d.web3.network_data[parseInt(d.web3.chainID)];
      const publish_button = 'Publish on ' + (network ? network.name : 'unsupported network');

      d.view.tmp('publish confirm', `
         <div class="view_back" onclick="d.view.open('main', 'right')"></div>
         <p>You're about to publish the draft as a pernament irremovable uneditable document.</p>
         <div class="button button-blue" onclick="d.publish.confirmed()">${publish_button}</div>`
      );
   },

   async confirmed()
   {
      d.web3.transaction();
   },

   addressChange()
   {
      const form_completed = polygon_address.value && accept_terms.classList.contains('checkbox-checked') ? 1 : 0;

      Array.from($('#publish_name .button')).forEach((e)=>{
         if(form_completed)
            e.classList.remove('button-disabled');
         else
            e.classList.add('button-disabled');
      });
   },

   name()
   {
      d.view.open('publish_name');
      if(typeof QRCode == 'undefined')
      {
         const s = document.createElement('script');
         s.src = "https://document.do/qrcode.js";
         document_.appendChild(s);
      }
   },

   eth:{
      async pay()
      {
         if($('#publish_name .button-disabled').length)
            return;

         d.slidein.open('<span class="loadingg"></span> Creating order...', 0, '', {class:'btc_payment'});
         d.publish.eth.order();
         d.publish.eth.payment = 1;
         d.web3.connect();
      },

      order()
      {
         const data = {
            name: d.doc.name,
            owner: polygon_address.value,
            type:'eth'
         };

         if(d.publish.eth.transaction && d.publish.eth.transaction.transaction_id)
            data.transaction_id = d.publish.eth.transaction.transaction_id;

         f('https://document.do/order/', data, {
            json:1,
            success:(json)=>{
               json.status = parseInt(json.status);

               if(json.status == 4)
                  return d.publish.eth.status4();
               else if(json.status > 0 && json.status < 3)
                  return setTimeout(d.publish.eth.order, 60000);

               if(json.amount != '')
               {
                  if(d.publish.eth.transaction)
                     d.publish.eth.transaction.amount = json.amount;
                  else
                     d.publish.eth.transaction = {amount:json.amount};
               }
            }
         });
      },

      request()
      {
         if(!d.publish.eth.transaction)
            return setTimeout(d.publish.eth.request, 200);

         slidein_title.innerHTML = '<span class="loadingg"></span> Waiting for you to confirm the transaction';

         const params = [{
             from: d.web3.account[0],
             to: '0x411E10f6D5F1117117B48A9fF88e458608ce6F63',
             value: '0x'+parseInt(d.publish.eth.transaction.amount).toString(16)
         }];

         window.ethereum.request({
               method: 'eth_sendTransaction',
               params
            })
            .then((r)=>{
               d.publish.eth.transaction.transaction_id = r;
               d.publish.eth.status1();
            })
            .catch((error) => {
               d.slidein.hide();

               
               if(error.code == 4001)
                  return;
         });
      },

      async confirm()
      {
         if(!d.publish.eth.transaction || !d.publish.eth.transaction.transaction_id)
            return;

         if(d.publish.eth.transaction.confirmed)
            return setTimeout(d.publish.eth.order, 10000);

         let tblockNumber = d.publish.eth.transaction.blockNumber;
         if(!tblockNumber)
         {
            tblockNumber = await d.web3.rpc({
               network:'eth',
               k:'blockNumber',
               params:d.publish.eth.transaction.transaction_id
            });
            d.publish.eth.transaction.blockNumber = tblockNumber = tblockNumber ? parseInt(tblockNumber) : 0;
         }

         let blockNumber = await d.web3.rpc({
            network:'eth',
            method:'eth_blockNumber'
         });
         blockNumber = blockNumber = blockNumber ? parseInt(blockNumber) : blockNumber;

         if(blockNumber && tblockNumber && blockNumber-tblockNumber > 6)
         {
            d.publish.eth.transaction.confirmed = 1;
            return d.publish.eth.order();
         }

         setTimeout(d.publish.eth.confirm, 30000);
      },

      status1()
      {
         d.slidein.lock();

         d.publish.eth.order();
         slidein_title.innerHTML = `<span class="loadingg"></span>We're verifying the transaction.`;
         slidein_content.innerHTML = '<div class="verifyinfo">This can take up to 3 minutes. Updates will show here automaticly.</div>';

         setTimeout(d.publish.eth.confirm, 30000);
      },

      status4()
      {
         d.publish.eth.transaction=d.publish.eth.blockNumber= d.publish.eth.payment = 0;
         d.publish.btc.status4();
      }
   },

   btc:{

      async pay()
      {
         if($('#publish_name .button-disabled').length)
            return;

         if(d.publish.btc.to)
            clearTimeout(d.publish.btc.to);

         if(!d.slidein.opened)
         {
            d.slidein.open('Buy with Bitcoin', 0, 'Loading...', {class:'btc_payment'});
            d.slidein.onHide = function(){
               if(d.publish.btc.to)
                  clearTimeout(d.publish.btc.to);
            };
         }

         
         await f('https://document.do/order/',
            {
               name: d.doc.name,
               owner: polygon_address.value,
               type:'btc'
            },
            {
               json:1,
               success:(json)=>{
                  if(json.btc_address || typeof json.status != 'undefined' && typeof d.publish.btc['status'+json.status] == 'function')
                  {
                     d.publish.btc['status'+json.status](json);
                     d.publish.btc.to = setTimeout(d.publish.btc.pay, 60000);
                     return;
                  }

                  d.error.show();
               }
            }
         );
      },

      status0(json)
      {
         const url = `bitcoin:${json.btc_address}?amount=${json.amount}`;
         const qr = window.innerWidth > 560 ? '<div>'+QRCode({msg:url, dim:200, pad:0}).outerHTML+'</div>' : '';

         slidein_title.innerHTML = '<span class="loadingg"></span> Waiting for the transaction';
         slidein_content.innerHTML = `<div id="btc_payment">
            <div>Send <strong id="btc_amount" onclick="navigator.clipboard.writeText(${json.amount});this.classList.add('copied');setTimeout(()=>btc_amount.classList.remove('copied'),2000)">${json.amount}</strong></div>
            <div>To <strong id="btc_address" onclick="navigator.clipboard.writeText('${json.btc_address}');this.classList.add('copied');setTimeout(()=>btc_address.classList.remove('copied'),2000)">${json.btc_address}</strong></div>
            ${qr}
            <a href="${url}" target="blank" class="button button-blue">Open in wallet</a>
         </div>`;
      },

      status1(json)
      {
         slidein_title.innerHTML = `<span class="loadingg"></span>Waiting for your transaction to be verified.`;
         slidein_content.innerHTML = '<div class="verifyinfo">This can take up to 30 minutes. Updates will show here automaticly.</div>';
      },

      status4(json)
      {
         slidein_title.innerHTML = `Thank you! We've received the payment.`;
         slidein_content.innerHTML = `<div>${polygon_address.value} is now the exclusive owner of <a onclick="window.location.reload(true)">${name_.value}</a>.</div>`;
      }
   }
},
slidein:{
   open:(title, page, html, s)=>{

      s = s ? s : {};

      if(d.slidein.locked)
         return;

      d.slidein.opened = 1;

      if(page)
         d.slidein.get(page, s);
      else if(html)
         slidein_content.innerHTML = html;

      document.body.classList.add('slidein_body');
      slidein_wrapper.style.display = 'block';
      slidein_title.innerHTML = title;

      if(s.class)
         slidein_wrapper.classList.add('si_'+s.class);

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
      const r = await fetch('https://document.do/pages/'+page+'.html');
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
         if($('.supported_chains').length)
            d.publish.confirm();
      });
      e.on('connect', (i)=> d.web3.chainID = i.chainId);
      e.on('disconnect', ()=> d.web3.chainID = 0);
      e.on('accountsChanged', (account)=>{
         d.web3.account = account;
         if(!d.length && $('.confirm').length)
            d.view.open('main', 'right');
      });
   },

   
   network_data:{
      1: {
         name:'Ethereum',
         ext:'eth',
         rpc:'https://eth.public-rpc.com',
         scan:'etherscan.io'
      },
      137: {
         name:'Polygon',
         ext:'pol',
         scan:'polygonscan.com',
         rpc:'https://rpc.ankr.com/polygon'
      }
   },

   async connect()
   {
      if(window.ethereum && window.ethereum.isConnected())
      {
         setTimeout(()=>{
            if(!$('.cwaiting').length && !d.web3.account.length)
               d.slidein.open('<div class="loadingg"></div><div class="cwaiting">Waiting for you to connect your wallet...</div>', 0);
         }, 800);

         window.ethereum.request({method: 'eth_requestAccounts'}).then((account) => {
            d.web3.account = account;

            if(!d.publish.eth.payment)
               d.slidein.hide();

            window.setTimeout(d.publish.confirm, 500);
         }).catch((error) => {
            d.slidein.hide();
         });
      }
      else
      {
         d.view.tmp('publish', `<div class="view_back" onclick="d.view.open('main', 'right')"></div>To publish a document you'll need a dapp browser like <a href="metamask" target="_blank">MetaMask</a>, <a href="metamask" target="_blank">Opera</a>.`)
      }
   },

   async transaction()
   {
      d.web3.network = d.web3.network_data[parseInt(d.web3.chainID)];

      const params = [
        {
          from: d.web3.account[0],
          to: d.web3.account[0],
          value: '0',
          data:'0x'+d.hex.encode(draftarea.value)
        }
      ];

      window.ethereum.request({
            method: 'eth_sendTransaction',
            params
         })
         .then((result) => {
            const submitted = d.web3.network ? d.web3.network.name : 'the unsupported network with chainID '+parseInt(d.web3.chainID);
            const view = d.web3.network ? `<p id="published_text">After the <a href="http://${d.web3.network.scan}/tx/${result}" target="_blank">transaction</a> is completed you can view the document here:</br><a href="#${result}.${d.web3.network.ext}">document.do#${result}.${d.web3.network.ext}</a></p>` : '';
            d.view.tmp('publish published', `
               <div class="view_back" onclick="d.view.open('main', 'right')"></div>
               <h2>Document submitted to ${submitted}</h2>
               ${view}
            `);
         })
         .catch((error) => {

            
            if(error.code == 4001)
               return;

            console.log('error', error);
      });
   },

   async rpc(o)
   {
      const response = await fetch(d.network(o.network ? o.network : '').rpc,{
         method: "POST",
         headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
         },
         body: JSON.stringify({
            jsonrpc: "2.0",
            method: (o.method ? o.method : 'eth_getTransactionByHash'),
            id:1,
            params:(o.params ? [o.params] : [])
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