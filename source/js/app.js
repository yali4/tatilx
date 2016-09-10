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