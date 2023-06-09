import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

interface MyData {
  Framework: string;
  Stars: number;
  Released: number;
}


@Component({
  selector: 'app-scatter',
  templateUrl: './scatter.component.html',
  styleUrls: ['./scatter.component.scss']
})
export class ScatterComponent implements OnInit {
  private data: MyData[] = [
    {"Framework": "Vue", "Stars": 166443, "Released": 2014},
    {"Framework": "React", "Stars": 150793, "Released": 2013},
    {"Framework": "Angular", "Stars": 62342, "Released": 2016},
    {"Framework": "Backbone", "Stars": 27647, "Released": 2010},
    {"Framework": "Ember", "Stars": 21471, "Released": 2011},
  ];
  private svg: HTMLElement|any;
  private margin = 50;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);

  private createSvg(): void {
    this.svg = d3.select("figure#scatter")
    .append("svg")
    .attr("width", this.width + (this.margin * 2))
    .attr("height", this.height + (this.margin * 2))
    .append("g")
    .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private keySelected: Map<string, boolean> = new Map<string,boolean>();

  private drawPlot(): void {

    const keys = this.data.map((data:MyData) => data.Framework)

    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(d3.schemeSet2);

    const Tooltip = d3.select("figure#scatter")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "absolute")

    const mouseover = (e:MouseEvent, data: MyData) => {
      console.log(e.target);
      Tooltip
        .style("opacity", 1)
        .style("display", "block");
      d3.select(e.currentTarget as d3.BaseType)
        .style("stroke", "black")
        .style("opacity", 1);
    }
    const mousemove = (e:MouseEvent, data: MyData) => {
      Tooltip
        .html("The exact value of<br>this cell is: " + data.Framework)
        .style("left", (e.pageX + 20) + "px")
        .style("top", (e.pageY) + "px");
    }
    const mouseleave = (e:MouseEvent, data: MyData) => {
      Tooltip
        .style("opacity", 0)
        .style("display", "none");
      d3.select(e.currentTarget as d3.BaseType)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }

    // Add X axis
    const x = d3.scaleLinear()
      .domain([2009, 2017])
      .range([ 0, this.width ]);
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 200000])
      .range([ this.height, 0]);
    this.svg.append("g")
      .call(d3.axisLeft(y));

    // Add dots
    const dots = this.svg.append('g');
      dots.selectAll("dot")
      .data(this.data)
      .enter()
      .append("circle")
        .attr("cx", (d: MyData) => x(d.Released))
        .attr("cy",  (d: MyData) => y(d.Stars))
        .attr("r", 3)
        .style("opacity", .5)
        .style("fill", (d: MyData, index: number) : string => color(d.Framework) as string)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);


    const legendBox = d3.select("figure#legend")
      .append("svg")
        .attr("width", 300)
        .attr("height", 300)
        .attr("class", "legend-box")
        .attr("fill", "white")
        .attr("stroke", "black")
        .style("margin",0)
      .append('g');

    // Add one dot in the legend for each name.
    legendBox.selectAll("mydots")
      .data(keys)
      .enter()
      .append("circle")
        .style("opacity", .5)
        .attr("cx", 100)
        .attr("cy", (d:string,i:number) =>  100 + i*25) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("r", 7)
        .style("fill", (d: string, index: number) : string =>  color(d) as string)
        .style("stroke", "black")
        .on("mouseover", (e: MouseEvent, f:string) => {
          if (this.keySelected.get(f) === true) {
            return;
          }
          d3.select(e.currentTarget as d3.BaseType)
            .style("opacity", 1);
          dots.selectAll("circle").filter((d:MyData) : boolean => {
            return d.Framework === f;
          }).style("opacity", 1)
            .style("stroke", "black");
        })
        .on("mouseleave", (e: MouseEvent, f:string) => {
          if (this.keySelected.get(f) === true) {
            return;
          }
          d3.select(e.currentTarget as d3.BaseType)
            .style("opacity", .5);
          dots.selectAll("circle").filter((d:MyData) : boolean => {
            return d.Framework === f;
          }).style("opacity", .5)
            .style("stroke", "none");
        })
        .on('click', (e: MouseEvent, f:string) => {
          if (this.keySelected.get(f) === true) {
            console.log("setting " + f + " color " + color(f) as string);
            d3.select(e.currentTarget as d3.BaseType)
              .style("fill", color(f) as string);
            this.keySelected.set(f, false);
            dots.selectAll("circle").filter((d:MyData) : boolean => {
              return d.Framework === f;
            }).style("fill", color(f) as string)
              .style("stroke", "black");
          }
          else {
            d3.select(e.currentTarget as d3.BaseType)
              .style("fill", "white");
            this.keySelected.set(f, true);
            dots.selectAll("circle").filter((d:MyData) : boolean => {
              return d.Framework === f;
            }).style("fill", "none")
              .style("stroke", "none");
          }
        });
  
    legendBox.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
        .attr("x", 120)
        .attr("y", (d:string,i:number) => 100 + i*25) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", "black")
        .text((d:string) => d)
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle");

  }

  ngOnInit(): void {
    this.createSvg();
    this.drawPlot();
  }


}