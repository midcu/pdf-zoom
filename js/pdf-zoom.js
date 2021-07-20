function pdfZoom(elId, options) {

    var mainMontainer = document.getElementById(elId);

    mainMontainer.style.overflow = "auto";

    var centerPoint = [mainMontainer.offsetWidth/2, mainMontainer.offsetHeight/2];

    var parentDiv = document.createElement("div");

    mainMontainer.appendChild(parentDiv);
            
    parentDiv.style["transform-origin"] = "left top";
    // parentDiv的初始的宽度和高度
    var boxRect = { height: 0, width: 0 };
    
    var me = this;
    
    var loadingTask = pdfjsLib.getDocument(options.pdfUrl);

    loadingTask.promise.then(function(pdf) {

        for (let i = 1; i <= pdf.numPages; i++) {
            pdf.getPage(i).then(function(page) {
                
                var viewport = page.getViewport({ scale: options.scale, });
                
                var pageDocument = document.createElement("div");
                pageDocument.id = "page1";
                pageDocument.style.marginTop = "10px";
                pageDocument.style.boxShadow = "0 2px 12px 0 rgb(0 0 0 / 10%)";
      
                var canvas = document.createElement("canvas");
    
                var context = canvas.getContext('2d');
    
                canvas.height = viewport.height;
                canvas.width = viewport.width;
    
                pageDocument.style.width = viewport.width;
                pageDocument.style.height = viewport.height;
    
                // 设置容器的宽度和高度
                boxRect.height+=(viewport.height + 10);
                boxRect.width=viewport.width;
    
                pageDocument.appendChild(canvas);
    
                parentDiv.appendChild(pageDocument);
    
                var renderContext = { canvasContext: context, viewport: viewport };
                page.render(renderContext);
                if (i === pdf.numPages) {
                    parentDiv.style.width = boxRect.width;
                    parentDiv.style.height = boxRect.height;
                    me.zoomInOut(Number(((mainMontainer.offsetWidth/viewport.width) * 0.66).toFixed(2)));
                }
            })
        }
    });

    this.zoomInOut = function (scale) {

        let parentDivScale = parentDiv.style.transform.match(/\s*scale\([-]?[0-9]+(\.[0-9]+)?\)/i);
        var newScale = scale;
        if (parentDivScale && parentDivScale[0]) {
            newScale = parentDivScale[0].replace("scale(", "").replace(")", "") * scale;
        }
        if (newScale > 1 || newScale < (mainMontainer.offsetWidth/boxRect.width) * 0.36) return;
        // 设置新的缩放等级
        parentDiv.style.transform = 'scale('+ newScale + ')';
        // 设置新的高度和宽度
        parentDiv.style.height = boxRect.height*newScale;
        parentDiv.style.width = boxRect.width*newScale;

        // 移动滚动条使得缩放中心不变
        me.scroll(centerPoint[0], centerPoint[1], scale);
        // 判断是否需要居中
        if (mainMontainer.offsetWidth > boxRect.width*newScale) {

            mainMontainer.style.display = "flex";
            mainMontainer.style["flex-direction"] = "column";
            mainMontainer.style["align-items"] = "center";
        } else {
            mainMontainer.style.display = "block";
            mainMontainer.style["flex-direction"] = "none";
            mainMontainer.style["align-items"] = "none";
        }
    }

    this.scroll = function(left, top, scale) {

        var lf = (left + mainMontainer.scrollLeft) * (scale - 1);
        var tp = (top + mainMontainer.scrollTop) * (scale - 1);

        mainMontainer.scrollTo(Math.round(mainMontainer.scrollLeft + lf), Math.round(mainMontainer.scrollTop + tp));
    }

    // 手势控制
    
    var rect = mainMontainer.getBoundingClientRect();

    var touchDistance = 0;

    getDisProportion = function(dm) {
        return dm / touchDistance;
    }

    getTouchesDistance = function(touches) {
        let xLen = Math.abs(touches[0].pageX - touches[1].pageX);
        let yLen = Math.abs(touches[0].pageY - touches[1].pageY);
    
        return Math.sqrt(xLen * xLen + yLen * yLen);
    }

    setTouchesCenter = function (touches) {
        let x = Math.round(touches[0].pageX/2 + touches[1].pageX/2);
        let y = Math.round(touches[0].pageY/2 + touches[1].pageY/2);

        centerPoint[0] = x - rect.left;
        centerPoint[1] = y - rect.top;
    }

    mainMontainer.addEventListener("touchstart", function(e) {
        if (e.touches.length > 1 && e.touches[0].target === e.touches[1].target) {
            touchDistance = getTouchesDistance(e.touches);
            setTouchesCenter(e.touches);
        }
    });
    mainMontainer.addEventListener("touchend", function(e) {
        touchDistance = 0;
        centerPoint = [mainMontainer.offsetWidth/2, mainMontainer.offsetHeight/2];
    });
    mainMontainer.addEventListener("touchmove", function(e) { 
        if (e.touches.length > 1 && e.touches[0].target === e.touches[1].target) {
            let dScale = getDisProportion(getTouchesDistance(e.touches));
        
            if (dScale < 0.95 || dScale > 1.05) {
                touchDistance = getTouchesDistance(e.touches);
                me.zoomInOut(dScale);
            }
        }
    });
}
