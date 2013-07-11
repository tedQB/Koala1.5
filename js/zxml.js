/*------------------------------------------------------------------------------
 * JavaScript zXml Library
 * Version 1.0
 * by Nicholas C. Zakas, http://www.nczonline.net/
 * Copyright (c) 2004-2005 Nicholas C. Zakas. All Rights Reserved.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307 USA
 *------------------------------------------------------------------------------
 */  
 
var zXml = {
    useActiveX: (typeof ActiveXObject != "undefined"),
    useDom: document.implementation && document.implementation.createDocument,
    useXmlHttp: (typeof XMLHttpRequest != "undefined")
};

zXml.ARR_XMLHTTP_VERS = ["MSXML2.XmlHttp.5.0", "MSXML2.XmlHttp.3.0", 
                         "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp",
                         "Microsoft.XmlHttp"];

zXml.ARR_DOM_VERS = ["MSXML2.DOMDocument.5.0", "MSXML2.DOMDocument.4.0", 
                     "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument",
                     "Microsoft.XmlDom"];
                     
function zXmlHttp() {
}

zXmlHttp.createRequest = function () {

    if (zXml.useXmlHttp) {
        return new XMLHttpRequest();
    } else if (zXml.useActiveX) {
  
        if (!zXml.XMLHTTP_VER) {
            for (var i=0; i < zXml.ARR_XMLHTTP_VERS.length; i++) {
                try {
                    new ActiveXObject(zXml.ARR_XMLHTTP_VERS[i]);
                    zXml.XMLHTTP_VER = zXml.ARR_XMLHTTP_VERS[i];
                    break;
                } catch (oError) {                
                }
            }
        }
        
        if (zXml.XMLHTTP_VER) {
            return new ActiveXObject(zXml.XMLHTTP_VER);
        } else {
            throw new Error("Could not create XML HTTP Request.");
        }
    } else {
        throw new Error("Your browser doesn't support an XML HTTP Request.");
    }

};

 
function zXmlDom() {

}

zXmlDom.createDocument = function () {

    if (zXml.useDom) {

        var oXmlDom = document.implementation.createDocument("","",null);

        oXmlDom.parseError = {
            valueOf: function () { return this.errorCode; },
            toString: function () { return this.errorCode.toString() }
        };
        
        oXmlDom.__initError__();
                
        oXmlDom.addEventListener("load", function () {
            this.__checkForErrors__();
            this.__changeReadyState__(4);
        }, false);

        return oXmlDom;        
        
    } else if (zXml.useActiveX) {
        if (!zXml.DOM_VER) {
            for (var i=0; i < zXml.ARR_DOM_VERS.length; i++) {
                try {
                    new ActiveXObject(zXml.ARR_DOM_VERS[i]);
                    zXml.DOM_VER = zXml.ARR_DOM_VERS[i];
                    break;
                } catch (oError) {                
                }
            }
        }
        
        if (zXml.DOM_VER) {
            return new ActiveXObject(zXml.DOM_VER);
        } else {
            throw new Error("Could not create XML DOM document.");
        }
    } else {
        throw new Error("Your browser doesn't support an XML DOM document.");
    }

};

var oMozDocument = null;
if (typeof XMLDocument != "undefined") {
    oMozDocument = XMLDocument;
} else if (typeof Document != "undefined") {
    oMozDocument = Document;
}

if (oMozDocument) {

    oMozDocument.prototype.readyState = 0;
    oMozDocument.prototype.onreadystatechange = null;

    oMozDocument.prototype.__changeReadyState__ = function (iReadyState) {
        this.readyState = iReadyState;

        if (typeof this.onreadystatechange == "function") {
            this.onreadystatechange();
        }
    };

    oMozDocument.prototype.__initError__ = function () {
        this.parseError.errorCode = 0;
        this.parseError.filepos = -1;
        this.parseError.line = -1;
        this.parseError.linepos = -1;
        this.parseError.reason = null;
        this.parseError.srcText = null;
        this.parseError.url = null;
    };
    
    oMozDocument.prototype.__checkForErrors__ = function () {

        if (this.documentElement.tagName == "parsererror") {

            var reError = />([\s\S]*?)Location:([\s\S]*?)Line Number (\d+), Column (\d+):<sourcetext>([\s\S]*?)(?:\-*\^)/;

            reError.test(this.xml);
            
            this.parseError.errorCode = -999999;
            this.parseError.reason = RegExp.$1;
            this.parseError.url = RegExp.$2;
            this.parseError.line = parseInt(RegExp.$3);
            this.parseError.linepos = parseInt(RegExp.$4);
            this.parseError.srcText = RegExp.$5;
        }
    };
            
    oMozDocument.prototype.loadXML = function (sXml) {
    
        this.__initError__();
    
        this.__changeReadyState__(1);
    
        var oParser = new DOMParser();
        var oXmlDom = oParser.parseFromString(sXml, "text/xml");
 
        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }

        for (var i=0; i < oXmlDom.childNodes.length; i++) {
            var oNewNode = this.importNode(oXmlDom.childNodes[i], true);
            this.appendChild(oNewNode);
        }
        
        this.__checkForErrors__();
        
        this.__changeReadyState__(4);

    };
    
    oMozDocument.prototype.__load__ = oMozDocument.prototype.load;

    oMozDocument.prototype.load = function (sURL) {
        this.__initError__();
        this.__changeReadyState__(1);
        this.__load__(sURL);
    };
    
    Node.prototype.__defineGetter__("xml", function () {
        var oSerializer = new XMLSerializer();
        return oSerializer.serializeToString(this, "text/xml");
    });

    Node.prototype.__defineGetter__("text", function () {
        var sText = "";
        for (var i = 0; i < this.childNodes.length; i++) {
            if (this.childNodes[i].hasChildNodes()) {
                sText += this.childNodes[i].text;
            } else {
                sText += this.childNodes[i].nodeValue;
            }
        }
        return sText;

    });

}


function zXslt() {

}


zXslt.transformToText = function (oXml, oXslt) {
    if (typeof XSLTProcessor != "undefined") {
        var oProcessor = new XSLTProcessor();
        oProcessor.importStylesheet(oXslt);
    
        var oResultDom = oProcessor.transformToDocument(oXml);
        var sResult = oResultDom.xml;
    
        if (sResult.indexOf("<transformiix:result") > -1) {
            sResult = sResult.substring(sResult.indexOf(">") + 1, 
                                        sResult.lastIndexOf("<"));
        }
    
        return sResult;     
    } else if (zXml.useActiveX) {
        return oXml.transformNode(oXslt);
    } else {
        throw new Error("No XSLT engine found.");
    }
};


function zXPath() {

}

zXPath.selectNodes = function (oRefNode, sXPath, sXmlNs) {
    if (typeof XPathEvaluator != "undefined") {
        var ns = (sXmlNs)?sXmlNs.split(" "):0; //Split the namespaces into an array of declarations
        var aNs = [];
        for (var i = 0; i < ns.length; i++) {
            aNs[i] = ns[i].replace("xmlns:","").split("="); //strip the xmlns: and =
            aNs[i][1] = aNs[i][1].substr(1,aNs[i][1].length-2); //strip the surrounding single quotes of the URL
		    }
	
        var nsResolver = function (sPrefix) {
    			  for (var i = 0; i < aNs.length; i++) {
    				    if (aNs[i][0] == sPrefix){ //Check the prefix
    					      return aNs[i][1]; //return the namespace
                }
    			  }
			      return null;
        };
		
        var oEvaluator = new XPathEvaluator();
        var oResult = oEvaluator.evaluate(sXPath, oRefNode, nsResolver, 
                                          XPathResult.ORDERED_NODE_ITERATOR_TYPE, 
                                          null);

        var aNodes = new Array;
        
        if (oResult != null) {
            var oElement = oResult.iterateNext();
            while(oElement) {
                aNodes.push(oElement);
                oElement = oResult.iterateNext();
            }
        }
        
        return aNodes;
        
    } else if (zXml.useActiveX) {
    
    		if (sXmlNs) {
    		    oRefNode.ownerDocument.setProperty("SelectionNamespaces", sXmlNs);
    		}
		
        return oRefNode.selectNodes(sXPath);
    } else {
        throw new Error("No XPath engine found.");
    }

};

zXPath.selectSingleNode = function (oRefNode, sXPath) {
    if (typeof XPathEvaluator != "undefined") {
    
        var ns = (sXmlNs)?sXmlNs.split(" "):0; //Split the namespaces into an array of declarations
        var aNs = [];
        for (var i = 0; i < ns.length; i++) {
            aNs[i] = ns[i].replace("xmlns:","").split("="); //strip the xmlns: and =
            aNs[i][1] = aNs[i][1].substr(1,aNs[i][1].length-2); //strip the surrounding single quotes of the URL
		    }
	
        var nsResolver = function (sPrefix) {
    			  for (var i = 0; i < aNs.length; i++) {
    				    if (aNs[i][0] == sPrefix){ //Check the prefix
    					      return aNs[i][1]; //return the namespace
                }
    			  }
			      return null;
        };
    
        var oEvaluator = new XPathEvaluator();
        var oResult = oEvaluator.evaluate(sXPath, oRefNode, nsResolver,
                                          XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    
        if (oResult != null) {
            return oResult.singleNodeValue;
        } else {
            return null;
        }              
    
    } else if (zXML.useActiveX) {
    		if (sXmlNs) {
    			oRefNode.ownerDocument.setProperty("SelectionNamespaces", sXmlNs);
    		}    
        return oRefNode.selectSingleNode(sXPath);
    } else {
        throw new Error("No XPath engine found.")
    }

};




/**
 * 
 */
function zXMLSerializer() {

}

zXMLSerializer.prototype.serializeToString = function (oNode) {

    var sXml = "";
    
    switch (oNode.nodeType) {
        case 1: //element
            sXml = "<" + oNode.tagName;
            
            for (var i=0; i < oNode.attributes.length; i++) {
                sXml += " " + oNode.attributes[i].name + "=\"" + oNode.attributes[i].value + "\"";
            }
            
            sXml += ">";
            
            for (var i=0; i < oNode.childNodes.length; i++){
                sXml += this.serializeToString(oNode.childNodes[i]);
            }
            
            sXml += "</" + oNode.tagName + ">";
            break;
            
        case 3: //text node
            sXml = oNode.nodeValue;
            break;
        case 4: //cdata
            sXml = "<![CDATA[" + oNode.nodeValue + "]]>";
            break;
        case 7: //processing instruction
            sXml = "<?" + oNode.nodevalue + "?>";
            break;
        case 8: //comment
            sXml = "<!--" + oNode.nodevalue + "-->";
            break;
        case 9: //document
            for (var i=0; i < oNode.childNodes.length; i++){
                sXml += this.serializeToString(oNode.childNodes[i]);
            }
            break;
            
    }  
    
    return sXml;
};