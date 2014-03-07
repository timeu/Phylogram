function speech() {
    
    var _phylogram =null,
        _commands = null,
        _isListening = false,
        _hasSynthesis = false;
    
    function sp(phylogram) {
        sp._hasSynthesis =  ('speechSynthesis' in window);
        
        sp.phylogram = phylogram;
        
        _commands = {
            'hi' : function() {
                _isListening = true;
                sp._displayListening();
                sp._speak('Yes. How can I help you?');
            },
            'pause': function() {
              _isListening = false;  
              sp._displayListening();
              sp._speak('Going to sleep!');
            },
            'change (fucking) type' : function() {
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
            'select (fucking) *type' : function(type) {
                if (!_isListening) 
                    return;
                if (type == 'None' || type == 'Non') {
                    phylogram.colorlegendout();
                }
                else {
                    phylogram.colorlegendover(type);
                }
            },
            'disable scale': function() {
                if (!_isListening) 
                    return;
                phylogram.scaleBranchLength(false);
            },
            'enable scale':  function() {
                if (!_isListening) 
                    return;
                phylogram.scaleBranchLength(true);
                    
            },
            'how many (are) from :type': function(type) {
                if (!_isListening) 
                    return;
                if (phylogram.colorLegendMap == null) {
                    sp._speak('Select a color category first');
                }
                var contains = phylogram.colorLegendMap().has(type);
                if (!contains) {
                    sp._speak('There is no color category ' + type);
                }
                else {
                    var count = colorLegendMap.get(type).length;
                    sp._speak('There are ' + count + ' nodes from '+ type);
                }
            },
            'make me a sandwich': function(d) {
                if (!_isListening) 
                    return;
                sp._speak('Do it yourself');
            },
            'please make me a sandwich': function(d) {
                if (!_isListening) 
                    return;
                sp._speak('You are getting warmer');
            },
            'sudo make me a sandwich': function(d) {
                if (!_isListening) 
                    return;
                sp._speak('You said the magic word. How about PB and J');
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
    sp._notRecognized = function() {
        sp._speak("Sorry I don't understand");
    };
    sp._speak = function(text) {
        if (sp._hasSynthesis) {
         var msg = new SpeechSynthesisUtterance(text);
          window.speechSynthesis.speak(msg);
        }
    };
    return sp;
}