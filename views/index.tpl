<div class="container main-page">
    {{#each departments}}
        <div class="department-zone">
            <h3 class="page-header">{{name}}</h3>
            <div class="row">
                {{#each templates}}
                <div class="col-lg-3 col-md-4 col-sm-6">
                    <a href="/template/{{folder}}/view" class="thumbnail">
                        <div class="caption">
                            <h4>{{name}}</h4>
                            <p class="text-muted">{{description}}</p>
                        </div>
                    </a>
                </div>
                {{/each}}
            </div>
        </div>
    {{/each}}
</div>

<ul>
    {{#each groups}}
    <li><a href="/template/group/view?name={{name}}">{{name}} ({{templates}})</a></li>
    {{/each}}
</ul>
