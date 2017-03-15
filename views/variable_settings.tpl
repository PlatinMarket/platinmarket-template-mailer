<div class="container">
  <h3 class="page-header">Değişken Ayarları</h3>
  <div class="row">
    <div class="col col-xs-12">
      <form data-zone="variable-settings" name="settings">
        <p align="center"><i class="fa fa-refresh fa-3x fa-spin"></i> <h4 align="center">Lütfen bekleyin</h4></p>
      </form>
      <button type="submit" class="btn btn-success" data-loading-text="Lütfen bekleyin..." disabled="disabled">Kaydet</button>
    </div>
  </div>
</div>

<script id="template-variable-settings" type="text/x-handlebars-template">
  {{{{raw-helper}}}}
    {{#each variables}}
      <div class="form-group">
        <label for="{{name}}">{{name}}</label>
        <input type="text" name="{{name}}" value="{{value}}" class="form-control" />
      </div>
    {{/each}}
  {{{{/raw-helper}}}}
</script>

<script>

  // Render settings
  $.get('/settings/variable.json').then(variables => Promise.resolve(Handlebars.compile($('#template-variable-settings').html())({ variables: variables.sort((a, b) => ([a.name, b.name]).sort().indexOf(a.name) - 1) })))
    .then((template) => Promise.resolve($(template).hide()))
    .then((template) => $("[data-zone='variable-settings']").html(template) && Promise.resolve(template))
    .then((template) => template.show('fast').promise().done(() => Promise.resolve()))
    .then(() => $("button[type='submit']").removeAttr('disabled'))
    .catch(err => toastr.error(err.responseJSON ? err.responseJSON.message : err.responseText));

  // Submit form
  $("button[type='submit']").on('click', (e) => {
    e.preventDefault();
    $(e.target).button('loading');
    $("form[name='settings']").find('input').attr('disabled', 'disabled');
    const settings = $("form[name='settings']").find('input').toArray().map(e => ({ name: $(e).attr('name'), value: $(e).val() || null }));
    $.ajax({ type: 'POST', url: '/settings/variable', data: JSON.stringify(settings), dataType: 'text', contentType: 'application/json'})
      .then(() => Promise.resolve($(e.target).button('reset') && $("form[name='settings']").find('input').removeAttr('disabled')))
      .then(() => toastr.success("Kaydedildi"))
      .catch((err) => {
        $(e.target).button('reset');
        toastr.error(err.responseJSON ? err.responseJSON.message : err.responseText);
        console.error(err.responseJSON || err.responseText || err);
      });
  });
</script>