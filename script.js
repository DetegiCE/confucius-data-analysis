import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const width = 1000;
const height = 1000;
const strength = -2000;

const data = await d3.json("data.json");

const color = d3.scaleOrdinal(d3.schemeCategory10);

const links = data.links.map(d => ({ ...d }));
const nodes = data.nodes.map(d => ({ ...d }));

d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody().strength(strength))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('link', d3.forceLink(links).id(d => d.id))
    .on("tick", () => {
        drawNodes();
        drawLines();
    }).on("end", () => console.log('end'));


const container = d3.select("svg");

const setRadius = (d) => {
    if (d.isMain) return 15;
    else return 5;
}

const setFontWeight = (d) => {
    if (d.isMain) return 700;
    else return 400;
}

const setFontSize = (d) => {
    if (d.isMain) return 30;
    else return 16;
}

const node =
    container
        .select("#node")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .each(function (d) {
            d3.select(this)
                .append("circle")
                .attr("r", setRadius(d))
                .style("fill", color(d.group));
            d3.select(this)
                .append("text")
                .attr('font-weight', setFontWeight(d))
                .attr('font-size', setFontSize(d))
                .text(d.id);
        })

const link =
    container
        .select("#link")
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke", "black");

const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id))
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(width / 2, height / 2))
    .on("tick", drawNodes)
    .on("tick", drawLines);

container
    .call(d3.drag()
        .subject(event => {
            const [px, py] = d3.pointer(event, container);
            return d3.least(nodes, ({ x, y }) => {
                const dist2 = (x - px) ** 2 + (y - py) ** 2;
                return dist2;
            });
        })
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))

function drawNodes() {
    node.attr("transform", d => "translate(" + [d.x, d.y] + ")");
}

function drawLines() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)
}

function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
}

function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
}

function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
}
