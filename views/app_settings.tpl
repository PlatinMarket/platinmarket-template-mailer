<link rel="stylesheet" type="text/css" href="/assets/font-awesome/css/font-awesome.min.css" />
<div class="container">
  <h3 class="page-header">Uygulama Ayarları</h3>
  <div class="row">
    <div class="col col-xs-12">
      <form data-zone="app-settings" name="settings">
        <p align="center"><i class="fa fa-refresh fa-3x fa-spin"></i> <h4 align="center">Lütfen bekleyin</h4></p>
      </form>
      <button type="submit" class="btn btn-success" data-loading-text="Lütfen bekleyin..." disabled="disabled">Kaydet</button>
    </div>
  </div>
</div>

<script id="template-settings" type="text/x-handlebars-template">
  {{{{raw-helper}}}}
    {{#each settings}}
      <div class="setting-node">
        {{#switch type}}
          {{#case "string"}}
            <div class="form-group">
              <label for="{{name}}">{{name}}</label>
              <input type="text" data-type="{{type}}" class="form-control" name="{{name}}" id="{{name}}" value="{{value}}" />
            </div>
          {{/case}}
          {{#case "number"}}
            <div class="form-group">
              <label for="{{name}}">{{name}}</label>
              <input type="number" data-type="{{type}}" class="form-control" name="{{name}}" id="{{name}}" value="{{value}}" />
            </div>
          {{/case}}
          {{#case "boolean"}}
            <div class="checkbox">
              <label for="{{name}}">
                <input type="checkbox" data-type="{{type}}" name="{{name}}" id="{{name}}" {{#if value}}checked="checked"{{/if}}/> {{name}}
              </label>
            </div>
          {{/case}}
          {{#case "array"}}
            <div class="form-group">
              <label for="{{name}}">{{name}} (virgül ile ayırınız)</label>
              <textarea class="form-control" data-type="{{type}}" name="{{name}}" id="{{name}}">{{value}}</textarea>
            </div>
          {{/case}}
        {{/switch}}
      </div>
    {{/each}}
  {{{{/raw-helper}}}}
</script>

<script src="/assets/speakingurl/speakingurl.min.js"></script>
<script>
  // Switch case helper
  Handlebars.registerHelper("switch", function(value, options) {
    this._switch_value_ = value;
    var html = options.fn(this); // Process the body of the switch block
    delete this._switch_value_;
    return html;
  });
  Handlebars.registerHelper("case", function() {
    // Convert "arguments" to a real array - stackoverflow.com/a/4775938
    var args = Array.prototype.slice.call(arguments);

    var options    = args.pop();
    var caseValues = args;

    if (caseValues.indexOf(this._switch_value_) === -1) {
      return '';
    } else {
      return options.fn(this);
    }
  });

  // Render settings
  $.get('/settings/app.json').then(settings => Promise.resolve(Handlebars.compile($('#template-settings').html())({ settings: settings.sort((a, b) => ([a.name, b.name]).sort().indexOf(a.name)) })))
    .then((template) => Promise.resolve($(template).hide()))
    .then((template) => $("[data-zone='app-settings']").html(template) && Promise.resolve(template))
    .then((template) => template.show('fast').promise().done(() => Promise.resolve()))
    .then(() => $("button[type='submit']").removeAttr('disabled'));

  // Parse value from HtmlElement by given type
  function parseValue(e) {
    switch ($(e).attr('data-type')) {
      case 'number': return parseInt($(e).val(), 10);
      case 'boolean': return e.checked;
      case 'array': return $(e).val().split(',').filter(n => n && n.trim() != "");
      default: return $(e).val().toString();
    }
  }

  // Submit form
  $("button[type='submit']").on('click', (e) => {
    e.preventDefault();
    $(e.target).button('loading');
    $("form[name='settings']").find('textarea, input').attr('disabled', 'disabled');
    const settings = $("form[name='settings']").find('textarea, input').toArray().map(e => ({ name: $(e).attr('name'), value: parseValue(e) }));
    $.ajax({ type: 'POST', url: '/settings/app', data: JSON.stringify(settings), dataType: 'json', contentType: 'application/json'})
      .then(settings => Promise.resolve(Handlebars.compile($('#template-settings').html())({ settings: settings.sort((a, b) => ([a.name, b.name]).sort().indexOf(a.name)) })))
      .then(template => $("[data-zone='app-settings']").html(template) && Promise.resolve(template))
      .then(() => Promise.resolve($(e.target).button('reset') && $("form[name='settings']").find('textarea, input').removeAttr('disabled')))
      .then(() => toastr.success("Kaydedildi"))
      .catch((err) => {
        $(e.target).button('reset');
        toastr.error(err.responseJSON ? err.responseJSON.message : err.responseText);
        console.error(err.responseJSON || err.responseText || err);
      });
  });
</script>