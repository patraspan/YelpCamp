$( document ).ready(function() {
  "use strict"; // Start of use strict

  // Floating label headings for the contact form
  $("body").on("input propertychange", ".floating-label-form-group", function(e) {
    $(this).toggleClass("floating-label-form-group-with-value", !!$(e.target).val());
  }).on("focus", ".floating-label-form-group", function() {
    $(this).addClass("floating-label-form-group-with-focus");
  }).on("blur", ".floating-label-form-group", function() {
    $(this).removeClass("floating-label-form-group-with-focus");
  });

  // Show the navbar when the page is scrolled up
  var MQL = 992;

  //primary navigation slide-in effect
  if ($(window).width() > MQL) {
    var headerHeight = $('#mainNav').height();
    $(window).on('scroll', {
        previousTop: 0
      },
      function() {
        var currentTop = $(window).scrollTop();
        //check if user is scrolling up
        if (currentTop < this.previousTop) {
          //if scrolling up...
          if (currentTop > 0 && $('#mainNav').hasClass('is-fixed')) {
            $('#mainNav').addClass('is-visible');
          } else {
            $('#mainNav').removeClass('is-visible is-fixed');
          }
        } else if (currentTop > this.previousTop) {
          //if scrolling down...
          $('#mainNav').removeClass('is-visible');
          if (currentTop > headerHeight && !$('#mainNav').hasClass('is-fixed')) $('#mainNav').addClass('is-fixed');
        }
        this.previousTop = currentTop;
      });
  }
//opening login modal
$('.loginButton').on('click', ()=> {
  console.log('clik');
$("#LoginModal").modal("show");
})

$('.custom-file-input').on('change',function(){
  var fileName = $(this).val().split('\\').pop();
  $(this).next('.custom-file-label').addClass("selected").html(fileName);
})
//adding active class to current page
$(".navbar-nav a").filter(function(){
  return this.href == location.href.replace(/#.*/, "");
}).addClass("active");


//focus in modal input
$('#LoginModal').on('shown.bs.modal', () => {
  setTimeout(() => {
      $('#modalUsername').focus();
  }, 100);
})

$(".summernote").summernote({
  picture: false,
  video: false,
  placeholder: "Type your description here",
  absize: 2,
  height: 200
})


});
