module.exports = function(RED) {
    function SliderNode(config) {
        var node = this;

        RED.nodes.createNode(this, config);

        // which page are we rendering this widget
        var page = RED.nodes.getNode(config.page);

        this.pt = config.passthru;
        this.state = [" "," "];

        node.status({});

        if (!node.pt) {
            node.on("input", function(msg) {
                node.state[0] = msg.payload;
                node.status({shape:"dot",fill:"grey",text:node.state[0] + " | " + node.state[1]});
            });
        }
        else if (node._wireCount === 0) {
            node.on("input", function(msg) {
                node.status({shape:"dot",fill:"grey",text:msg.payload});
            });
        }

        const evts = {
            onChange: true,
            onInput: function (msg, send) {
                send(msg)
            }
        }

        // inform the dashboard UI that we are adding this node
        page.register(node, config, evts)
    }
    RED.nodes.registerType("ui-slider", SliderNode);
};