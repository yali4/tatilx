/**
 * Created by efe.sozen on 3.09.2016.
 */
(function(){
  "use strict";
  
    return {
        init: function () {
            
        }
    }

})();

/* Primary Carousel */
(function () {

    var carousel = $('.primary-carousel .owl-carousel');

    carousel.owlCarousel({
        navigation : true, // Show next and prev buttons
        slideSpeed : 300,
        paginationSpeed : 400,
        singleItem:true,
        navigationText: ['<i class="tb-arrow-left"></i>','<i class="tb-arrow-right"></i>'],
        dots: true
    });
})();

/* Navbar */
(function () {
    var navbarHasSubItems = $('.nav .has-sub');

    navbarHasSubItems.each(function () {
        var $this = $(this),
            arrow = $this.find('.arrow-dropdown');

        arrow.click(function (e) {
            $this.toggleClass('open');
            e.preventDefault();
        });

    });
})();

/* Human Functions */
(function(){

    $(document).click(function(e) {

        if (!$(e.target).is(".human-caption, .human-wrapper *"))
        {
            $(".human-wrapper").fadeOut();
        }

    });

    $(".human-caption").click(function(e){

        var self = $(this);

        self.next(".human-wrapper").fadeToggle();

    });

    // human select close function
    /*
    $(".close-human-select").click(function(e) {

        e.preventDefault();

        var panel = $(this).closest(".human-wrapper");

        panel.fadeOut("slow");

    });
    */

    // human select box change function
    $("select.adult").change(function(){

        var parent = $(this).closest(".human-wrapper");

        updatePersonValues(parent);

    });

    // child select box change function
    $("select.child-num").change(function(){

        var self = $(this);

        var value = parseInt(self.val());

        var parent = self.closest(".human-wrapper");

        updatePersonValues(parent);

        var children = parent.find(".new-child");

        var oldValue = children.children().length;

        if ( value < oldValue )
        {
            children.children().slice(value, oldValue).remove();
        }

        else if ( value > oldValue )
        {
            var template = "";

            for ( var i = oldValue; i < value; i++ )
            {
                template += "<div class='children'><label>" + (i+1) + ". Çocuk</label>";
                template += "<select name='childAge[]'>";
                template += "<option value=''>Yaş</option>";

                for (var n = 1; n < 17; n++)
                {
                    template += "<option value=" + n + ">" + n + "</option>";
                }

                template += "</select></div>";
            }

            children.append(template);
        }

    });

    function updatePersonValues(parent)
    {
        var adultCount = parseInt(parent.find("select.adult").val());
        var childCount = parseInt(parent.find("select.child-num").val());

        parent.parent().find(".human-caption").html(adultCount + " Yetişkin - " + childCount + " Çocuk");
    }

})();

/* Hotel Search Range Pickers */
(function(){

    var options = {
        showDropdowns: false,
        autoApply: true,
        dateFormat: "dd.mm.yy",
        autoUpdateInput: true,
        dateLimit :{
            "days": 19
        },
        changeYear: true,
        minDate: new Date()
    };

    function renderDateRangers()
    {
        var pickers = $("input.daterange");

        pickers.each(function(){

            var self = $(this);

            if ( self.data("daterangepicker") ) return;

            var parent = self.closest(".datetime-selector");
            var container = self.closest(".search-box");

            var startDate = parent.find(".startdate");
            var endDate = parent.find(".enddate");

            //var syncSelector = self.attr("data-sync");
            var currentOptions = $.extend(options, {
                parentEl: container,
                startDate: startDate.val(),
                endDate: endDate.val()
            });

            var picker = self.daterangepicker(currentOptions, function(start, end, label, triggered) {

                startDate.val(start.format("DD.MM.YYYY"));
                endDate.val(end.format("DD.MM.YYYY"));

            }, {

                startDateListener: function(start)
                {
                    startDate.val(start.format("DD.MM.YYYY"));
                },

                endDateListener: function(end)
                {
                    //
                }

            }).data("daterangepicker");

            parent.click(function(){

                picker.show();

            });

            // For Position
            $(window).bind("resize scroll", function(){

                if ( picker.isShowing )
                {
                    picker.move();
                }

            });

        });
    }

    renderDateRangers();

    window.renderDateRangers = renderDateRangers;

})();