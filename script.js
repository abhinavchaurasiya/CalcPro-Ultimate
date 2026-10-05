const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
let current="0",expression="",memory=Number(localStorage.getItem("calcpro-memory")||0);
let history=JSON.parse(localStorage.getItem("calcpro-history")||"[]"),justCalculated=false;
const operators=["+","−","×","÷"];

function formatNumber(n){if(!Number.isFinite(n))return"Error";if(Object.is(n,-0))n=0;return String(Number(n.toPrecision(12)))}
function display(){$("#expression").textContent=expression;$("#result").textContent=current}
function digit(v){if(current==="Error"||justCalculated){current=v;expression="";justCalculated=false}else if(current==="0")current=v;else if(current.length<16)current+=v;display()}
function decimal(){if(current==="Error"||justCalculated){current="0.";expression="";justCalculated=false}else if(!current.includes("."))current+=".";display()}
function op(v){if(current==="Error")return;if(justCalculated){expression=current;justCalculated=false}if(operators.includes(expression.slice(-1)))expression=expression.slice(0,-1)+v;else expression+=current+v;current="0";display()}
function safeEval(raw){
  const x=raw.replaceAll("×","*").replaceAll("÷","/").replaceAll("−","-").replaceAll("π",Math.PI);
  if(!/^[0-9+\-*/.()\seE]+$/.test(x))throw Error("Invalid");
  const n=Function('"use strict";return ('+x+')')();
  if(typeof n!=="number"||!Number.isFinite(n))throw Error("Math");
  return n
}
function equals(){if(!expression||current==="Error")return;let raw=expression;if(operators.includes(raw.slice(-1)))raw+=current;else if(!raw.endsWith(current))raw+=current;try{const a=formatNumber(safeEval(raw));addHistory(raw,a);expression=raw+" =";current=a;justCalculated=true;display()}catch{expression="Invalid calculation";current="Error";justCalculated=true;display()}}
function clearAll(){current="0";expression="";justCalculated=false;display()}
function backspace(){if(current==="Error"||justCalculated)return clearAll();current=current.length>1?current.slice(0,-1):"0";display()}
function percent(){if(current!=="Error"){current=formatNumber(Number(current)/100);display()}}
function sign(){if(current!=="0"&&current!=="Error"){current=current.startsWith("-")?current.slice(1):"-"+current;display()}}
function scientific(fn){if(current==="Error")return;const n=Number(current);let r;if(!Number.isFinite(n))return;
if(fn==="sin")r=Math.sin(n*Math.PI/180);if(fn==="cos")r=Math.cos(n*Math.PI/180);if(fn==="tan")r=Math.tan(n*Math.PI/180);if(fn==="sqrt")r=Math.sqrt(n);if(fn==="log")r=Math.log10(n);if(fn==="ln")r=Math.log(n);if(fn==="square")r=n*n;if(fn==="reciprocal")r=1/n;
current=Number.isFinite(r)?formatNumber(r):"Error";justCalculated=true;display()}
function addHistory(exp,res){history.unshift({exp,res,time:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})});history=history.slice(0,25);localStorage.setItem("calcpro-history",JSON.stringify(history));renderHistory()}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function renderHistory(){if(!history.length){$("#historyList").innerHTML='<div class="history-empty"><b>◷</b><h3>No calculations yet</h3><p>Your recent calculations will appear here.</p></div>';return}$("#historyList").innerHTML=history.map((h,i)=>`<div class="history-item" data-i="${i}"><div class="history-exp">${escapeHtml(h.exp)} <small>${escapeHtml(h.time)}</small></div><div class="history-result">= ${escapeHtml(h.res)}</div></div>`).join("")}

$("#keypad").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const v=b.dataset.value,a=b.dataset.action;if(v!==undefined){if(/^\d$/.test(v))digit(v);else if(v===".")decimal();else if(v==="π"){if(current==="0"||justCalculated)current=String(Math.PI);else current+=String(Math.PI);justCalculated=false;display()}else if(v==="("||v===")")op(v);else if(operators.includes(v))op(v);return}if(a==="clear")clearAll();if(a==="sign")sign();if(a==="percent")percent();if(a==="backspace")backspace();if(a==="equals")equals()});
$$("[data-fn]").forEach(b=>b.addEventListener("click",()=>scientific(b.dataset.fn)));
$$("[data-memory]").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.memory;if(a==="clear")memory=0;if(a==="recall"){current=formatNumber(memory);justCalculated=true;display()}if(a==="add")memory+=Number(current);if(a==="subtract")memory-=Number(current);localStorage.setItem("calcpro-memory",memory)}));
$("#clearHistory").addEventListener("click",()=>{history=[];localStorage.removeItem("calcpro-history");renderHistory()});
$("#historyList").addEventListener("click",e=>{const item=e.target.closest(".history-item");if(!item)return;current=history[+item.dataset.i].res;expression="";justCalculated=false;display()});
$$(".tab").forEach(t=>t.addEventListener("click",()=>{$$(".tab").forEach(x=>x.classList.remove("active"));t.classList.add("active");const calc=t.dataset.mode==="calculator";$("#calculatorMode").hidden=!calc;$("#currencyMode").hidden=calc}));
$("#themeBtn").addEventListener("click",()=>{document.body.classList.toggle("dark");const d=document.body.classList.contains("dark");$("#themeBtn").textContent=d?"☾":"☀";localStorage.setItem("calcpro-theme",d?"dark":"light")});
if(localStorage.getItem("calcpro-theme")==="dark"){document.body.classList.add("dark");$("#themeBtn").textContent="☾"}
document.addEventListener("keydown",e=>{if(!$("#currencyMode").hidden)return;const k=e.key;if(/^\d$/.test(k))digit(k);else if(k===".")decimal();else if(k==="+")op("+");else if(k==="-")op("−");else if(k==="*"||k.toLowerCase()==="x")op("×");else if(k==="/"){e.preventDefault();op("÷")}else if(k==="%")percent();else if(k==="Enter"||k==="="){e.preventDefault();equals()}else if(k==="Backspace")backspace();else if(k==="Escape"||k.toLowerCase()==="c")clearAll()});

const currencies=[
["USD","US Dollar","$","🇺🇸"],["INR","Indian Rupee","₹","🇮🇳"],["EUR","Euro","€","🇪🇺"],["GBP","British Pound","£","🇬🇧"],
["JPY","Japanese Yen","¥","🇯🇵"],["AUD","Australian Dollar","A$","🇦🇺"],["CAD","Canadian Dollar","C$","🇨🇦"],
["CHF","Swiss Franc","CHF","🇨🇭"],["CNY","Chinese Yuan","¥","🇨🇳"],["SGD","Singapore Dollar","S$","🇸🇬"],
["AED","UAE Dirham","د.إ","🇦🇪"],["NZD","New Zealand Dollar","NZ$","🇳🇿"]
];

function fillCurrencies(){
  const options=currencies.map(c=>`<option value="${c[0]}">${c[3]} ${c[0]} — ${c[1]}</option>`).join("");
  $("#fromCurrency").innerHTML=options;
  $("#toCurrency").innerHTML=options;
  $("#fromCurrency").value="USD";
  $("#toCurrency").value="INR";
}

function setStatus(text,type="normal"){
  $("#rateStatus").textContent=text;
  $("#rateStatus").style.color=type==="error"?"#c34848":type==="loading"?"#8b6500":"";
}

/*
  Currency fix:
  1. Uses ExchangeRate-API's public endpoint instead of the previous endpoint.
  2. Fetches a complete rate table for the selected source currency.
  3. Has a timeout and proper HTTP/JSON validation.
  4. Has a small offline fallback table so common currencies still convert
     if the API is temporarily unavailable.
*/
const fallbackUsdRates={
  USD:1, INR:96.378852, EUR:0.88731, GBP:0.757129, JPY:157.92293,
  AUD:1.442918, CAD:1.423249, CHF:0.832335, CNY:6.714553,
  SGD:1.280486, AED:3.6725, NZD:1.784419
};

const rateCache=new Map();

async function fetchRates(baseCurrency){
  if(rateCache.has(baseCurrency)) return rateCache.get(baseCurrency);

  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),8000);

  try{
    const url=`https://open.er-api.com/v6/latest/${encodeURIComponent(baseCurrency)}`;
    const response=await fetch(url,{
      method:"GET",
      headers:{"Accept":"application/json"},
      cache:"no-store",
      signal:controller.signal
    });

    if(!response.ok) throw new Error(`HTTP ${response.status}`);

    const data=await response.json();
    if(data.result!=="success" || !data.rates || typeof data.rates!=="object"){
      throw new Error("Invalid exchange-rate response");
    }

    rateCache.set(baseCurrency,data.rates);
    return data.rates;
  }finally{
    clearTimeout(timer);
  }
}

function fallbackRate(from,to){
  if(!fallbackUsdRates[from] || !fallbackUsdRates[to]) return null;
  return fallbackUsdRates[to]/fallbackUsdRates[from];
}

async function convert(){
  const amount=Number($("#amount").value);
  const from=$("#fromCurrency").value;
  const to=$("#toCurrency").value;

  if(!Number.isFinite(amount) || amount<0){
    $("#converted").textContent="—";
    $("#rateInfo").textContent="Please enter a valid amount.";
    setStatus("Invalid","error");
    return;
  }

  if(from===to){
    $("#converted").textContent=amount.toLocaleString(undefined,{maximumFractionDigits:4});
    $("#rateInfo").textContent=`1 ${from} = 1 ${to}`;
    setStatus("Ready");
    return;
  }

  setStatus("Loading…","loading");
  $("#converted").textContent="—";
  $("#rateInfo").textContent="Fetching exchange rate…";

  try{
    const rates=await fetchRates(from);
    const rate=Number(rates[to]);

    if(!Number.isFinite(rate) || rate<=0) throw new Error("Target currency missing");

    const value=amount*rate;
    $("#converted").textContent=value.toLocaleString(undefined,{maximumFractionDigits:4});
    $("#rateInfo").textContent=`1 ${from} = ${rate.toFixed(6)} ${to} • Live rate`;
    setStatus("Updated");
  }catch(error){
    console.warn("Live currency API unavailable:",error);

    // Offline fallback keeps the converter functional for the supported currencies.
    const rate=fallbackRate(from,to);

    if(rate){
      const value=amount*rate;
      $("#converted").textContent=value.toLocaleString(undefined,{maximumFractionDigits:4});
      $("#rateInfo").textContent=`1 ${from} ≈ ${rate.toFixed(6)} ${to} • Offline fallback rate`;
      setStatus("Fallback","error");
    }else{
      $("#converted").textContent="—";
      $("#rateInfo").textContent="Conversion unavailable. Check your internet connection and try again.";
      setStatus("Offline","error");
    }
  }
}

$("#swapBtn").addEventListener("click",()=>{
  const from=$("#fromCurrency").value;
  $("#fromCurrency").value=$("#toCurrency").value;
  $("#toCurrency").value=from;
  convert();
});

$("#convertBtn").addEventListener("click",(event)=>{
  event.preventDefault();
  convert();
});

$("#fromCurrency").addEventListener("change",convert);
$("#toCurrency").addEventListener("change",convert);

$("#amount").addEventListener("input",()=>{
  clearTimeout(window.convertTimer);
  window.convertTimer=setTimeout(convert,350);
});

fillCurrencies();
renderHistory();
display();
convert();
