(function () {
    showCommitId();
    var es = new EventSource("/build/" + getCommitId());
    es.addEventListener("build_log", function(event){
        $(".log-console").append("\n" + event.data);
    });

    es.addEventListener("build_finished", function(event){
        es.close();
        if (event.data == 'SUCCESS') {
            $(".log-console").append('\nDocker host is ready! Reloading ...');
            document.location.reload();
        } else {
            $(".log-console").append('\nBuild failed.');
        }
    });
})();

function showCommitId() {
    $(".commit-id").text(getCommitId());
}
function getCommitId() {
 return document.location.host.split(".")[0];
}
