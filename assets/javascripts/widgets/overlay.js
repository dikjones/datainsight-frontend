var GOVUK = GOVUK || {};
GOVUK.Insights= GOVUK.Insights || {};

GOVUK.Insights.overlay = function () {
    function CalloutBox(boxInfo) {
        var htmlTemplate = '<div class="format-success-hover"><div class="format"/><div class="details"/></div>',
            element = undefined,
            timeout = undefined;
        
        var setGeometryCss = function () {
            if (boxInfo.width) element.width(boxInfo.width);
            if (boxInfo.height) element.height(boxInfo.height);
            if (boxInfo.xPos) element.css({left: boxInfo.xPos});
            if (boxInfo.yPos) element.css({top: boxInfo.yPos});  
        };
        
        this.draw = function () {
            $('.format-success-hover').remove();
            element = $(htmlTemplate);
            setGeometryCss();
            element.find('.format').text(boxInfo.title);
            element.find('.details').html(boxInfo.description);
            element.on('mouseover', this.cancelClose);
            element.on('mouseout', this.close);
            element.appendTo(boxInfo.parent);
        };
        
        unDraw = function () {
            element.remove();
        };
        
        this.close = function () {
            timeout = setTimeout(unDraw,300);
        };
        
        this.cancelClose = function () {
            window.clearTimeout(timeout);
            timeout = undefined;
        };
        
        // on construction
        this.draw();
    };
    
    return {
        CalloutBox: CalloutBox
    };
}();