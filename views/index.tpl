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
	<h3 class="page-header">Gruplar</h3>
	<div class="row">
		<div class="list-group">
		   {{#each groups}}
		   <div class="col-lg-3 col-md-4 col-sm-6">
				<a href="/template/group/view?name={{name}}" class="thumbnail">
					<div class="caption">
						<h4>{{name}}</h4>
						<p class="text-muted">{{templates}}</p>
					</div>
				</a>
			</div>
			{{else}}
			<div class="col-xs-12 text-danger">Henüz grup eklenmemiş</div>
			{{/each}}
		</div>
	</div>
</div>

