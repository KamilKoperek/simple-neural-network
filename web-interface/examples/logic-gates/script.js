let or_network = new network(JSON.parse(or_model))
or_network.setInputMethod("range", document.getElementById("or").getElementsByClassName("input")[0]);
or_network.setOutputMethod("full", document.getElementById("or").getElementsByClassName("output")[0]);

let xor_network = new network(JSON.parse(xor_model))
xor_network.setInputMethod("range", document.getElementById("xor").getElementsByClassName("input")[0]);
xor_network.setOutputMethod("full", document.getElementById("xor").getElementsByClassName("output")[0]);

let or3_network = new network(JSON.parse(or3_model))
or3_network.setInputMethod("range", document.getElementById("or3").getElementsByClassName("input")[0]);
or3_network.setOutputMethod("full", document.getElementById("or3").getElementsByClassName("output")[0]);

let not_network = new network(JSON.parse(not_model))
not_network.setInputMethod("range", document.getElementById("not").getElementsByClassName("input")[0]);
not_network.setOutputMethod("full", document.getElementById("not").getElementsByClassName("output")[0]);
