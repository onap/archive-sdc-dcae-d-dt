var DcaeApp = function(){

};

DcaeApp.prototype = {
    render: function render(parameters, element) {
        //parameters.options;
        //parameters.onEvent;
        alert("render");
    },
    unmount: function unmount(element){
        alert("unmount " + element);
    }
};

PunchOutRegistry.register('dcaeApp', function() { new DcaeApp(); });
