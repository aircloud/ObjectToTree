/**
 * Created by Xiaotao.Nie on 2017/5/7.
 * All right reserved
 * IF you have any question please email onlythen@yeah.net
 */

function ObjectToTree (obj,cfg = {}) {

    let testObject = obj || {};
    testObject = arrayToObject(testObject);

    const arrayColor =  cfg.arrayColor || '#41D9B7';
    const objColor = cfg.objColor || '#108EE9';
    const judgeNumber = /^[0-9]*$/;
    const blockHeight = cfg.blockHeight || 120;
    const unitHeight = cfg.unitHeight || 60;
    const unitPadding =  cfg.unitPadding || 20;
    const treeNodeMargin = cfg.treeNodeMargin || 20;
    const topPadding = 10;
    const littleLineOffset = 4;
    const mainFontSize = cfg.mainFontSize  || 15;

    const canvas = document.getElementById("canvas");

    candiWidth = getSpaceLength(testObject)+(getSpaceNumber(testObject)+1)*treeNodeMargin+(getSpaceNumber(testObject))*unitPadding*2;
    candiHeight = (getObjectDepth(testObject))*100+60;

    canvas.style.width=candiWidth/2+"px";
    canvas.setAttribute('width',candiWidth+"px");

    canvas.style.height=candiHeight+"px";
    canvas.setAttribute('height',candiHeight*2+"px");

    //这个sizeof并不是标准的计算sizeof,而是计算空间尺度,注意:目前并没有采用这个版本的sizeof
    function sizeof(str, charset){
        let total = 0,
            charCode,
            i,
            len;
        charset = charset ? charset.toLowerCase() : '';
        if(charset === 'utf-16' || charset === 'utf16'){
            for(i = 0, len = str.length; i < len; i++){
                charCode = str.charCodeAt(i);
                if(charCode <= 0xffff){
                    total += 2;
                }else{
                    total += 4;
                }
            }
        }else{
            for(i = 0, len = str.length; i < len; i++){
                charCode = str.charCodeAt(i);
                if(charCode <= 0x007f) {
                    total += 1;
                }else if(charCode <= 0x07ff){
                    total += 1;
                }else if(charCode <= 0xffff){
                    total += 2;
                }else{
                    total += 2;
                }
            }
        }
        return total;
    }


    function spacesizeof(str,config){

        let testSpan = document.createElement('span');
        testSpan.style.visibility = 0;
        testSpan.style.margin = 0;
        testSpan.style.padding= 0;
        testSpan.style.fontSize = mainFontSize*2 + 'px';
        testSpan.innerHTML=str;

        if(config && typeof(config) === 'object') {
            let allConfigs = Object.keys(config);
            for (let item of allConfigs) {
                testSpan.style[item] = allConfigs[item];
            }
        }

        document.body.appendChild(testSpan);
        let width = testSpan.offsetWidth;
        document.body.removeChild(testSpan);
        return width;
    }

    function arrayToObject(input){
        if(Object.prototype.toString.apply(input)==='[object Array]'){
            let result = {};
            for(let i = 0;i<input.length;i++){
                result[i.toString()] = arrayToObject(input[i]);
            }
            return result;
        }
        else if(Object.prototype.toString.apply(input)==='[object Object]') {
            let keys = Object.keys(input),
                SpaceLength = 0;

            for (let item of keys) {
                input[item] = arrayToObject(input[item]);
            }
        }
        return input;
    }

    function getSpaceLength(obj, compensation){

        let compen = compensation || 150;

        //如果不是对象,直接toString返回
        if(Object.prototype.toString.apply(obj)!=='[object Object]'){
            return spacesizeof(obj.toString());
        }

        let keys = Object.keys(obj),
            SpaceLength = 0;

        for(let item of keys) {
            if(item[0]==='_')continue;
            SpaceLength += getSpaceLength(obj[item]);
        }

        if(keys.length===1)SpaceLength+=compen;
        return SpaceLength;

    }

    //返回最下层keys的数量
    function getSpaceNumber(obj){
        if(Object.prototype.toString.apply(obj)==='[object Array]'){
            obj = arrayToObject(obj);
        }
        //如果不是对象,直接toString返回
        else if(Object.prototype.toString.apply(obj)!=='[object Object]'){
            return 1
        }

        let keys = Object.keys(obj),
            SpaceLength = 0;

        for(let item of keys) {
            if(item[0]==='_')continue;
            SpaceLength += getSpaceNumber(obj[item]);
        }
        return SpaceLength;

    }

    function getObjectDepth(obj){
        let depth = 0,
            keys = Object.keys(obj),
            hasObjects = false;

        obj.__TreeDepNow = obj.__TreeDepNow || 1;

        for(let i = 0;i<keys.length;i++){
            if(Object.prototype.toString.apply(obj[keys[i]])==='[object Object]'){
                obj[keys[i]].__TreeDepNow = obj.__TreeDepNow + 1;
                hasObjects = true;
                let tempDepth = getObjectDepth(obj[keys[i]]);
                if(depth < tempDepth){
                    depth = tempDepth;
                }
            }
        }

        depth+=1;
        return depth;
    }

    (function ObjectTree() {

        let ctx = canvas.getContext('2d');

        ctx.font = `bold ${mainFontSize*2}px arial`;
        ctx.fillStyle = "blue";

        let grad=ctx.createLinearGradient(0,0,canvas.width,0);
        grad.addColorStop("0","magenta");
        grad.addColorStop("0.5","yellow");
        grad.addColorStop("1.0","red");

        function DrawUnit(beginX,beginY, stringData,config = {}) {

            let color = objColor;
            if( config.type && config.type === 'array'){
                color = arrayColor;
            }
            let rectWidth = spacesizeof(stringData.toString()) + unitPadding*2;

            ctx.fillStyle=color;
            ctx.fillRect(beginX,beginY,rectWidth,unitHeight);

            ctx.fillStyle="#FFFFFF";
            ctx.strokeStyle = grad;
            ctx.fillText(stringData,beginX+unitPadding,beginY+unitHeight/2+mainFontSize/2);
            if( config.tip) {
                ctx.fillStyle = color;
                ctx.strokeStyle = grad;
                ctx.fillText(config.tip, beginX + unitPadding, beginY + unitHeight + mainFontSize * 2);
            }
        }

        function DrawConnect(startX,startY,endX,endY,config = {}){

            let color = objColor;
            if(config.type && config.type === 'array'){
                color = arrayColor ;
            }

            ctx.beginPath();
            ctx.fillStyle=color;
            ctx.lineWidth=4;//画笔粗细
            ctx.lineCap="round";  //要把画线的方式改成这个圆形否则不好做
            ctx.moveTo(startX,startY);
            ctx.strokeStyle = color;
            ctx.lineTo(endX,endY);
            ctx.stroke();//stroke() 方法会实际地绘制出通过 moveTo() 和 lineTo() 方法定义的路径。默认颜色是黑色
            ctx.closePath();
        }


        function DrawObject(obj,config){
            let beginX = config && config.beginX || 10,
                beginY = config && config.beginY || 10,
                spaceLength = getSpaceLength(obj),
                treeDepth = getObjectDepth(obj),
                spaceNumber = getSpaceNumber(obj);

            let offsetLeft = beginX,offsetHeight = beginY;

            let objName = config && config.name || "object";

            let titleSpaceLength = getSpaceLength(objName);

            let keys = Object.keys(obj);

            DrawUnit(beginX+((spaceNumber+1)*treeNodeMargin+spaceNumber*unitPadding*2)/2 + spaceLength/2-unitPadding*2,beginY+topPadding,objName);

            for(let item of keys){
                if(item === '__TreeDepNow') continue;
                if(Object.prototype.toString.apply(obj[item])!=='[object Object]'){
                    if(judgeNumber.test(item)){
                        DrawUnit(offsetLeft + treeNodeMargin, offsetHeight + blockHeight + unitHeight, obj[item],{type:'array',tip:cfg.showTip && item});
                        DrawConnect(beginX+ ((spaceNumber+1)*treeNodeMargin+spaceNumber*unitPadding*2)/2 + spaceLength/2-unitPadding+titleSpaceLength/2,offsetHeight+unitHeight+topPadding,
                            offsetLeft+treeNodeMargin+(getSpaceLength(obj[item])+unitPadding*2)/2,offsetHeight+blockHeight+unitHeight+littleLineOffset,{type:'array'});
                    }
                    else {
                        DrawUnit(offsetLeft + treeNodeMargin, offsetHeight + blockHeight + unitHeight, obj[item],{tip:cfg.showTip &&item});
                        DrawConnect(beginX+ ((spaceNumber+1)*treeNodeMargin+spaceNumber*unitPadding*2)/2 + spaceLength/2-unitPadding+titleSpaceLength/2,offsetHeight+unitHeight+topPadding,
                            offsetLeft+treeNodeMargin+(getSpaceLength(obj[item])+unitPadding*2)/2,offsetHeight+blockHeight+unitHeight+littleLineOffset);
                    }
                    offsetLeft += getSpaceLength(obj[item])+unitPadding*2 + treeNodeMargin;

                } else{
                    DrawConnect(beginX+((spaceNumber+1)*treeNodeMargin+spaceNumber*unitPadding*2)/2+spaceLength/2-unitPadding+titleSpaceLength/2,offsetHeight+unitHeight+topPadding,
                        offsetLeft+(getSpaceLength(obj[item])/2+((getSpaceNumber(obj[item])+1)*treeNodeMargin+(getSpaceNumber(obj[item]))*unitPadding*2)/2),offsetHeight+blockHeight+unitHeight+littleLineOffset);
                    DrawObject(obj[item],{
                        beginX:offsetLeft,
                        beginY:offsetHeight+blockHeight+unitHeight-topPadding,
                        name:item,
                    });
                    offsetLeft += getSpaceLength(obj[item])+(getSpaceNumber(obj[item])+1)*treeNodeMargin+(getSpaceNumber(obj[item]))*unitPadding*2+unitPadding*2 + treeNodeMargin*2;
                }
            }
        }

        DrawObject(testObject);

    }());

}
