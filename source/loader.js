var tf = new TouchFeeds.Main({fit: true});
document.body.onload = function() {
    //new TouchFeeds.Main({fit: true}).write();
    tf.fit && tf.setupBodyFitting();
    var tfhtml = tf.generateHtml();
    document.body.innerHTML = tfhtml;
    tf.rendered();
}
