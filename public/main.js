function add_one_more_url(button) {
  var twin = document.getElementById('url_dummy').cloneNode(true);
  twin.removeAttribute('id');
  var input = twin.firstChild;
  button.parentNode.insertBefore(twin, button);
  setTimeout(function(){
    twin.className = 'last';
    input.focus();
  }, 0);
  setTimeout(function(){
    twin.className = '';
  }, 100);
}
var form = document.forms[0];
form.onsubmit = function disableEmptyInputs(){
  var i = form.length;
  while (i--) {
    if (form[i].value === '' || form[i].value === form[i].getAttribute('placeholder') || form[i].type === 'submit') {
      form[i].disabled = true;
    }
  }
  return true;
};
window.onunload = function enableEmptyInputs(){
  var i = form.length;
  while (i--) {
    if (form[i].disabled) {
      form[i].removeAttribute('disabled');
    }
  }
};
history.navigationMode = 'fast';