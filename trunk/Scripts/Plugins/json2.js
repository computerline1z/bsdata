var JSON; if(!JSON) { JSON={} } (function() { function str(a, b) { var c, d, e, f, g=gap, h, i=b[a]; if(i&&typeof i==="object"&&typeof i.toJSON==="function") { i=i.toJSON(a) } if(typeof rep==="function") { i=rep.call(b, a, i) } switch(typeof i) { case "string": return quote(i); case "number": return isFinite(i)?String(i):"null"; case "boolean": case "null": return String(i); case "object": if(!i) { return "null" } gap+=indent; h=[]; if(Object.prototype.toString.apply(i)==="[object Array]") { f=i.length; for(c=0; c<f; c+=1) { h[c]=str(c, i)||"null" } e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]"; gap=g; return e } if(rep&&typeof rep==="object") { f=rep.length; for(c=0; c<f; c+=1) { if(typeof rep[c]==="string") { d=rep[c]; e=str(d, i); if(e) { h.push(quote(d)+(gap?": ":":")+e) } } } } else { for(d in i) { if(Object.prototype.hasOwnProperty.call(i, d)) { e=str(d, i); if(e) { h.push(quote(d)+(gap?": ":":")+e) } } } } e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}"; gap=g; return e } } function quote(a) { escapable.lastIndex=0; return escapable.test(a)?'"'+a.replace(escapable, function(a) { var b=meta[a]; return typeof b==="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4) })+'"':'"'+a+'"' } function f(a) { return a<10?"0"+a:a } "use strict"; if(typeof Date.prototype.toJSON!=="function") { Date.prototype.toJSON=function(a) { return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null }; String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a) { return this.valueOf() } } var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta={ "\b": "\\b", "\t": "\\t", "\n": "\\n", "\f": "\\f", "\r": "\\r", '"': '\\"', "\\": "\\\\" }, rep; if(typeof JSON.stringify!=="function") { JSON.stringify=function(a, b, c) { var d; gap=""; indent=""; if(typeof c==="number") { for(d=0; d<c; d+=1) { indent+=" " } } else if(typeof c==="string") { indent=c } rep=b; if(b&&typeof b!=="function"&&(typeof b!=="object"||typeof b.length!=="number")) { throw new Error("JSON.stringify") } return str("", { "": a }) } } if(typeof JSON.parse!=="function") { JSON.parse=function(text, reviver) { function walk(a, b) { var c, d, e=a[b]; if(e&&typeof e==="object") { for(c in e) { if(Object.prototype.hasOwnProperty.call(e, c)) { d=walk(e, c); if(d!==undefined) { e[c]=d } else { delete e[c] } } } } return reviver.call(a, b, e) } var j; text=String(text); cx.lastIndex=0; if(cx.test(text)) { text=text.replace(cx, function(a) { return "\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4) }) } if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) { j=eval("("+text+")"); return typeof reviver==="function"?walk({ "": j }, ""):j } throw new SyntaxError("JSON.parse") } } })()
var JSON; if(!JSON) { JSON={}; }
(function() {
   "use strict"; function f(n) { return n<10?'0'+n:n; }
   if(typeof Date.prototype.toJSON!=='function') {
      Date.prototype.toJSON=function(key) {
         return isFinite(this.valueOf())?this.getUTCFullYear()+'-'+
f(this.getUTCMonth()+1)+'-'+
f(this.getUTCDate())+'T'+
f(this.getUTCHours())+':'+
f(this.getUTCMinutes())+':'+
f(this.getUTCSeconds())+'Z':null;
      }; String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(key) { return this.valueOf(); };
   }
   var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g, gap, indent, meta={ '\b': '\\b', '\t': '\\t', '\n': '\\n', '\f': '\\f', '\r': '\\r', '"': '\\"', '\\': '\\\\' }, rep; function quote(string) { escapable.lastIndex=0; return escapable.test(string)?'"'+string.replace(escapable, function(a) { var c=meta[a]; return typeof c==='string'?c:'\\u'+('0000'+a.charCodeAt(0).toString(16)).slice(-4); })+'"':'"'+string+'"'; }
   function str(key, holder) {
      var i, k, v, length, mind=gap, partial, value=holder[key]; if(value&&typeof value==='object'&&typeof value.toJSON==='function') { value=value.toJSON(key); }
      if(typeof rep==='function') { value=rep.call(holder, key, value); }
      switch(typeof value) {
         case 'string': return quote(value); case 'number': return isFinite(value)?String(value):'null'; case 'boolean': case 'null': return String(value); case 'object': if(!value) { return 'null'; }
            gap+=indent; partial=[]; if(Object.prototype.toString.apply(value)==='[object Array]') {
               length=value.length; for(i=0; i<length; i+=1) { partial[i]=str(i, value)||'null'; }
               v=partial.length===0?'[]':gap?'[\n'+gap+partial.join(',\n'+gap)+'\n'+mind+']':'['+partial.join(',')+']'; gap=mind; return v;
            }
            if(rep&&typeof rep==='object') { length=rep.length; for(i=0; i<length; i+=1) { if(typeof rep[i]==='string') { k=rep[i]; v=str(k, value); if(v) { partial.push(quote(k)+(gap?': ':':')+v); } } } } else { for(k in value) { if(Object.prototype.hasOwnProperty.call(value, k)) { v=str(k, value); if(v) { partial.push(quote(k)+(gap?': ':':')+v); } } } }
            v=partial.length===0?'{}':gap?'{\n'+gap+partial.join(',\n'+gap)+'\n'+mind+'}':'{'+partial.join(',')+'}'; gap=mind; return v;
      }
   }
   if(typeof JSON.stringify!=='function') {
      JSON.stringify=function(value, replacer, space) {
         var i; gap=''; indent=''; if(typeof space==='number') { for(i=0; i<space; i+=1) { indent+=' '; } } else if(typeof space==='string') { indent=space; }
         rep=replacer; if(replacer&&typeof replacer!=='function'&&(typeof replacer!=='object'||typeof replacer.length!=='number')) { throw new Error('JSON.stringify'); }
         return str('', { '': value });
      };
   }
   if(typeof JSON.parse!=='function') {
      JSON.parse=function(text, reviver) {
         var j; function walk(holder, key) {
            var k, v, value=holder[key]; if(value&&typeof value==='object') { for(k in value) { if(Object.prototype.hasOwnProperty.call(value, k)) { v=walk(value, k); if(v!==undefined) { value[k]=v; } else { delete value[k]; } } } }
            return reviver.call(holder, key, value);
         }
         text=String(text); cx.lastIndex=0; if(cx.test(text)) {
            text=text.replace(cx, function(a) {
               return '\\u'+
('0000'+a.charCodeAt(0).toString(16)).slice(-4);
            });
         }
         if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) { j=eval('('+text+')'); return typeof reviver==='function'?walk({ '': j }, ''):j; }
         throw new SyntaxError('JSON.parse');
      };
   }
} ());