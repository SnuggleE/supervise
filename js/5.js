$('[data-chufa="xiala"]').click(function(e){
  e.preventDefault();
  $(this).next().toggle();
})