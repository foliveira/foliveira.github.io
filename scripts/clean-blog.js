
$(function() {
    var MQL = 1170;

    $("[data-toggle='tooltip']").tooltip();

    $("a[data-toggle=\"tab\"]").click(function(e) {
      e.preventDefault();
      $(this).tab("show");
    });

    /*When clicking on Full hide fail/success boxes */
    $('#name').focus(function() {
      $('#success').html('');
    });

    //make all images responsive
    $("img").addClass("img-responsive");

    //primary navigation slide-in effect
    if ($(window).width() > MQL) {
      var headerHeight = $('.navbar-custom').height();
      $(window).on('scroll', {
        previousTop: 0
      },
      function() {
        var currentTop = $(window).scrollTop();
        //check if user is scrolling up
        if (currentTop < this.previousTop) {
          //if scrolling up...
          if (currentTop > 0 && $('.navbar-custom').hasClass('is-fixed')) {
            $('.navbar-custom').addClass('is-visible');
          } else {
            $('.navbar-custom').removeClass('is-visible is-fixed');
          }
        } else {
          //if scrolling down...
          $('.navbar-custom').removeClass('is-visible');
          if (currentTop > headerHeight && !$('.navbar-custom').hasClass('is-fixed')) $('.navbar-custom').addClass('is-fixed');
        }
        this.previousTop = currentTop;
      });
    }
});
