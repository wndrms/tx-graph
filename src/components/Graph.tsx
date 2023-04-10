import React from 'react';
import * as echarts from 'echarts/core';
import { GraphChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsOption } from 'echarts';

// Register necessary components
echarts.use([
  GraphChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  CanvasRenderer,
]);

interface GraphProps {
  data: {
    nodes: Array<{ name: string }>;
    links: Array<{ source: string; target: string }>;
  };
}

const Graph: React.FC<GraphProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current);
      const options: EChartsOption = {
        title: {
          text: 'Money Laundering',
        },
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: true,
        },
        series: [
          {
            type: 'graph',
            layout: 'force',
            symbolSize: 10,
            roam: true,
            label: {
              show: false,
            },
            draggable: true,
            data: data.nodes,
            links: data.links,
          },
        ],
      };
      chart.setOption(options);
    }
  }, [data]);

  return <div ref={chartRef} style={{ height: '500px' }} />;
};

export default Graph;