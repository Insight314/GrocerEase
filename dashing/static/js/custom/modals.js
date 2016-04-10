/* global $, Dashboard */


$(document).ready(function() {
    // *****************
    // Settings
    // *****************
    
    
    
    // *****************
    // List Settings
    // *****************
    
    
    

    // *****************
    // Add New List
    // *****************
    
    var max_fields      = 15; //maximum input boxes allowed
    var wrapper         = $(".itemInputWrapper"); //Fields wrapper
    var add_button      = $("#addItemButton"); //Add button ID
    
    var x = 1; //initlal text box count
    $(add_button).click(function(e){ //on add input button click
        e.preventDefault();
        if(x < max_fields){ //max input box allowed
            x++; //text box increment
            $(wrapper).append('<div class="input-group"><input name="items[]" type="text" class="form-control"><span class="input-group-btn"><a id="removeItem" href="#" class="btn btn-secondary" role="button">Remove</a></span></div>'); //add input box
            //$(wrapper).append('<div><input type="text" name="mytext[]"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
        }
    });
    
    $(wrapper).on("click","#removeItem", function(e){ //user click on remove text
        e.preventDefault(); $(this).parent('span').parent('div').remove(); x--;
        var dashboard = new Dashboard();

    })
    
});