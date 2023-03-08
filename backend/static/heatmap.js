(function () {
    var margin = { top: 50, right: 0, bottom: 0, left: 0 },
      width = window.innerWidth,
      height = window.innerHeight - 50,
      formatNumber = d3.format(",d"),
      transitioning;
  
    var x = d3.scale.linear()
      .domain([0, width])
      .range([0, width]);
  
    var y = d3.scale.linear()
      .domain([0, height])
      .range([0, height]);
  
    var color = d3.scale.threshold()
      .domain([-3, -0.25, 0.25, 3])
      .range(["#F63538", "#8B444E", "#404040", "#35764E", "#30CC5A"]);
  
    var treemap = d3.layout.treemap()
      .children(function (d, depth) { return depth ? null : d._children; })
      .sort(function (a, b) { return a.value - b.value; })
      .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
      .round(false);
  
    var svg = d3.select("#heatmap").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.bottom + margin.top)
      .style("margin-left", -margin.left + "px")
      .style("margin.right", -margin.right + "px")
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .style("shape-rendering", "crispEdges");
  
    var grandparent = svg.append("g")
      .attr("class", "grandparent")
      .attr("id", "banner");
  
    grandparent.append("rect")
      .attr("y", -margin.top)
      .attr("width", width)
      .attr("height", margin.top)
  
    grandparent.append("foreignObject")
      .attr("id", "dates")
      .attr("x", 200)
      .attr("y", -50)
      .attr("width", window.innerWidth)
      .attr("height", 50)
  
    grandparent.append("text")
       .attr("x", 6)
       .attr("y", -18)
       //.attr("dy", ".75em")
       .attr("class", "title");

    d3.queue()
      .defer(d3.json, "data.json")
      .await(function (error, root) {
        if (error) throw error;
        initialize(root);
        accumulate(root);
        layout(root);
        display(root);
  
        function initialize(root) {
          root.x = root.y = 0;
          root.dx = width;
          root.dy = height;
          root.depth = 0;
          d3.select('#dates')
            .html("<div class=\"dropdown\" style=\"float:left;padding-top:8px;\">" +
            "<button class=\"btn btn-outline-dark dropdown-toggle\" id=\"dropDownMenu\" type=\"button\" data-toggle=\"dropdown\" name=\"type\">Macroeconomic type" +
            "<span class=\"caret\"></span></button>" +
            "<ul class=\"dropdown-menu\" id=\"dropdown-menu\">" +
            "<li><a href=\"#\">HTML</a></li>" +
            "<li><a href=\"#\">CSS</a></li>" +
            "<li><a href=\"#\">JavaScript</a></li>" +
            "</ul>" +
            "</div>" +
            "<div class=\"input-daterange input-group\" id=\"datepicker\" style=\"padding-top:10px;padding-left: 10px;float:left\">" +
            "<input type=\"text\" class=\"input-sm form-control\" id=\"startDate\" name=\"stateDate\" placeholder=\"From\" style=\"width:100px;\"/>" +
            "<input type=\"text\" class=\"input-sm form-control\" id=\"endDate\" name=\"endDate\" placeholder=\"To\" style=\"width:100px;float:left;\"/>" +
            "<button type=\"submit\" form=\"form1\" class=\"btn btn-primary\" style=\"margin-left:15px\" onclick=\"post('/')\">Go!</button>" + 
            "</div>")
          // d3.select("#dates")
          //   .html("<div\">" +
          //   "<pre style=\"font: 15px sans-serif;\">" +
          //   "  Date: <input type=\"text\" id=\"fromDate\" class=\"ui-widget\" placeholder=\"Start\" style=\"width: 150px;text-align: center;\">" + 
          //   " To <input type=\"text\" id=\"toDate\" class=\"ui-widget\" placeholder=\"End\" style=\"width: 150px;text-align: center;\"><nobr> " +
          //   "</div>");
  
          // https://github.com/qodesmith/datepicker#readme
          // const fromDate = datepicker('#fromDate', {
          //   position: 'bl',
          //   id: 1,
          //   formatter: (input, date, instance) => {
          //     const value = date.toLocaleDateString('fr-CA')
          //     input.value = value // => 'YYYY-MM-DD'
          //   },
          //   onSelect: (instance, date) => {
          //     console.log(fromDate.getRange());
          //   }
          // });
          // const toDate = datepicker('#toDate', {
          //   position: 'bl',
          //   id: 1,
          //   formatter: (input, date, instance) => {
          //     const value = date.toLocaleDateString('fr-CA')
          //     input.value = value // => 'YYYY-MM-DD'
          //   },
          //   onSelect: (instance, date) => {
          //     console.log(toDate.getRange());
          //   }
          // });
        }
  
        function accumulate(d) {
          return (d._children = d.children)
            ? d.value = d.children.reduce(function (p, v) { return p + accumulate(v); }, 0)
            : d.value;
        }
  
        function layout(d) {
          if (d._children) {
            treemap.nodes({ _children: d._children });
            d._children.forEach(function (c) {
              c.x = d.x + c.x * d.dx;
              c.y = d.y + c.y * d.dy;
              c.dx *= d.dx;
              c.dy *= d.dy;
              c.parent = d;
              layout(c);
            });
          }
        }
  
        function getContrast50(hexcolor) {
          return (parseInt(hexcolor.replace('#', ''), 16) > 0xffffff / 3) ? 'black' : 'white';
        }
  
        function display(d) {
          grandparent
            .datum(d.parent)
            .on("click", transition)
            .select("text")
            .text(name(d));
  
          grandparent
            .datum(d.parent)
            .select("rect")
            .attr("fill", function () { return color(d['rate']) })
  
          var g1 = svg.insert("g", ".grandparent")
            .datum(d)
            .attr("class", "depth");
  
          var g = g1.selectAll("g")
            .data(d._children)
            .enter().append("g");
  
          g.filter(function (d) { return d._children; })
            .classed("children", true)
            .on("click", transition);
  
          g.selectAll(".child")
            .data(function (d) { return d._children || [d]; })
            .enter().append("rect")
            .attr("class", "child")
            .call(rect);
  
          d3.select("#heatmap").select("#tooltip").remove();
          var div = d3.select("#heatmap").append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);
  
          g.append("svg:a")
            .attr("xlink:href", function (d) {
              if (!d._children) {
                var url = "#";
                return url;
              }
            })
            .append("rect")
            .attr("class", "parent")
            .call(rect)
            .on("mouseover", function (d) {
              if (d.parent.name != "MARKET") {
                d3.select("#tooltip").transition()
                  .duration(200)
                  .style("opacity", 1);
                d3.select("#tooltip").html("<h3>" + d.name + "</h3><table>" +
                  "<tr><td>" + d.value + "</td><td> (" + d.rate + "%)</td></tr>" +
                  "</table>")
                  .style("left", (d3.event.pageX - document.getElementById('heatmap').offsetLeft + 20) + "px")
                  .style("top", (d3.event.pageY - document.getElementById('heatmap').offsetTop - 60) + "px");
              }
            })
            .on("mouseout", function (d) {
              d3.select("#tooltip").transition()
                .duration(500)
                .style("opacity", 0);
            })
            .append("title")
            .text(function (d) { return formatNumber(d.value); });
  
  
          g.append("text")  // 股票分類和股票名稱
            .attr("dy", ".75em")
            .text(function (d) { return d.name; })
            .call(text);
  
          function transition(d) {
            if (transitioning || !d) return;
            transitioning = true;
  
            var g2 = display(d),
              t1 = g1.transition().duration(750),
              t2 = g2.transition().duration(750);
  
            x.domain([d.x, d.x + d.dx]);
            y.domain([d.y, d.y + d.dy]);
  
            svg.style("shape-rendering", null);
  
            svg.selectAll(".depth").sort(function (a, b) { return a.depth - b.depth; });
  
            g2.selectAll("text").style("fill-opacity", 0);
  
            t1.selectAll("text").call(text).style("fill-opacity", 0);
            t2.selectAll("text").call(text).style("fill-opacity", 1);
            t1.selectAll("rect").call(rect);
            t2.selectAll("rect").call(rect);
  
            t1.remove().each("end", function () {
              svg.style("shape-rendering", "crispEdges");
              transitioning = false;
            });
          }
  
          return g;
        }
  
        function text(text) {
          text.attr("x", function (d) { return x(d.x) + (x(d.x + d.dx) - x(d.x)) / 2; })
            .attr("y", function (d) { return y(d.y) + (y(d.y + d.dy) - y(d.y)) / 2; })
            .attr("dy", 0)
            .attr("font-size", function (d) {
              var w = x(d.x + d.dx) - x(d.x),
                h = y(d.y + d.dy) - y(d.y),
                t = (d.name).length / 1.3;
              var tf = Math.min(Math.floor(w / t), h / 3);
              return (tf >= 5) ? Math.min(tf, 30) : 0;
            })
            .attr("fill", "white")
            .attr("text-anchor", "middle");
        }
  
        function rect(rect) {
          rect.attr("x", function (d) { return x(d.x); })
            .attr("y", function (d) { return y(d.y); })
            .attr("width", function (d) { return x(d.x + d.dx) - x(d.x); })
            .attr("height", function (d) { return y(d.y + d.dy) - y(d.y); })
            .attr("fill", function (d) { return color(parseFloat(d.rate)); });
        }
  
        function name(d) {
          return d.parent
            ? "Back to Overall"
            : "Overall " + d.name;
        }
      });

      $(document).ready(function(){
        $("#dropDownMenu").on('click', function () {
          if ($('#dates').attr('height') == 50) {
            $('#dates').attr('height', 500);
            console.log("test");
            $("#dropdown-menu").attr('class', 'dropdown-menu show');
          }
          else {
            console.log($("#dropdown-menu").attr('class'));
            $("#dropdown-menu").attr('class', 'dropdown-menu');
            console.log($("#dropdown-menu").attr('class'));
            //$('#dates').attr('height', 50);
          }
        });
        $(".dropdown-menu").on('click', 'li a', function () {
          $(".btn:first-child").text($(this).text());
          $(".btn:first-child").val($(this).text());
          $('#dates').attr('height', 50);
          $("#dropdown-menu").attr('class', 'dropdown-menu');
        });
        $("#datepicker").datepicker({
          format: "yyyy-mm-dd",
          orientation: "bottom auto",
          endDate: "2023-03-01",
          multidate: false,
          daysOfWeekDisabled: "0,6",
          autoclose: true,
          startView: 1
        }).datepicker('update', new Date());
      });
  }());

  function post(path, method = 'post') {
    // The rest of this code assumes you are not using a library.
    // It can be made less verbose if you use one.
    const params = Object.create(null);
    params["type"] = document.getElementById("dropDownMenu").value;
    params["startDate"] = document.getElementById("startDate").value;
    params["endDate"] = document.getElementById("endDate").value;
    if(params["type"] == "" | params["startDate"] == "" | params["endDate"] == ""){
        alert("Must enter all values");
    }
    else{
        console.log(params);
        const form = document.createElement('form');
        form.method = method;
        form.action = path;
        for (const key in params) {
            const hiddenField = document.createElement('input');
            hiddenField.type = 'hidden';
            hiddenField.name = key;
            hiddenField.value = params[key];
            form.appendChild(hiddenField);
        }
        document.body.appendChild(form);
        form.submit();
    }
}
  