function speech() {
    
    var _phylogram =null,
        _commands = null,
        _isListening = false;
    
    function sp(phylogram) {
        sp.phylogram = phylogram;
        
        _commands = {
            'hi' : function() {
                _isListening = true;
                sp._displayListening();
            },
            'pause': function() {
              _isListening = false;  
              sp._displayListening();
            },
            'change type' : function() {
                if (!_isListening) 
                    return;
                phylogram.isRadial(!phylogram.isRadial());
            },
            'show help' : function() {
                sp._showhelp();
            },
            'change color to :type' : function(type) {
                if (!_isListening) 
                    return;
                phylogram.colorLegendType(type);
            },
            'change size to :type': function(type) {
                 if (!_isListening) 
                    return;
                phylogram.sizeLegendType(type);
            },
            'select *type' : function(type) {
                if (!_isListening) 
                    return;
                if (type == 'None') {
                    phylogram.colorlegendout();
                }
                else {
                    phylogram.colorlegendover(type);
                }
            }
        };
    }
    
    sp._displayListening = function() {
        var speechstate = d3.select("#speechstate");
        if (speechstate == null)
            return;
        if (_isListening) {
            speechstate.text('Listening...Say "Pause" to stop listening...');
        }
        else {
            speechstate.text('Paused...Say "Hi" to start listening...') ;
        }
    };
    
    sp._showhelp = function() {
        
    };
    
    sp.phylogram = function(_) {
        if (!arguments.length) return phylogram;
        phylogram = _;
        return sp;
    };
    
    sp.commands = function(_) {
        if (!arguments.length) return _commands;
        _commands = _;
        return sp;
    };
    
    return sp;
}