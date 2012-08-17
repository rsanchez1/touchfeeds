enyo.kind({
    name: "TouchFeeds.Main",
    kind: "Panels",
    classes: "app enyo-unselectable",
    realtimeFit: true,
    arrangerKind: "CollapsingArranger",
    loggedIn: false,
    sortAndFilterTimeout: false,
    keyWasDown: false,
    components: [
        {name: "feeds", width: "320px", kind: "FittableRows", components: [
            {kind: "onyx.Toolbar", components: [
                {content: "Arrangers"}
            ]},
            {kind: "Scroller", fit: true}
        ]},
        {name: "articles", width: "320px", kind: "FittableRows", components: [
        ]},
        {name: "singleArticle", kind: "FittableRows", components: [
        ]}
    ],
    create: function() { 
        this.inherited(arguments);
    },
    rendered: function() {
        this.inherited(arguments);
    }
});
