<!-- 
  CompanyAnalyticsChart.vue
  A reusable component for rendering interactive charts for company analytics
-->
<template>
  <div class="chart-container" :style="{ height: height }">
    <canvas :id="chartId" ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  name: 'CompanyAnalyticsChart',
  
  props: {
    // Chart type: line, bar, pie, doughnut, etc.
    type: {
      type: String,
      required: true,
      validator: (value) => ['line', 'bar', 'pie', 'doughnut', 'radar', 'polarArea'].includes(value)
    },
    
    // Chart data
    data: {
      type: Object,
      required: true
    },
    
    // Chart options
    options: {
      type: Object,
      default: () => ({})
    },
    
    // Chart height
    height: {
      type: String,
      default: '300px'
    },
    
    // Unique chart ID
    chartId: {
      type: String,
      default: () => `chart-${Math.random().toString(36).substring(2, 9)}`
    }
  },
  
  data() {
    return {
      chart: null
    };
  },
  
  mounted() {
    this.createChart();
  },
  
  methods: {
    createChart() {
      const ctx = this.$refs.chartCanvas.getContext('2d');
      
      // Default options based on chart type
      const defaultOptions = this.getDefaultOptions();
      
      // Merge default options with provided options
      const chartOptions = {
        ...defaultOptions,
        ...this.options
      };
      
      // Create the chart
      this.chart = new Chart(ctx, {
        type: this.type,
        data: this.data,
        options: chartOptions
      });
    },
    
    getDefaultOptions() {
      // Default options based on chart type
      const defaults = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false
          },
          legend: {
            position: 'top',
          },
          title: {
            display: false
          }
        }
      };
      
      // Additional options based on chart type
      switch (this.type) {
        case 'line':
          return {
            ...defaults,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          };
          
        case 'bar':
          return {
            ...defaults,
            scales: {
              y: {
                beginAtZero: true
              }
            }
          };
          
        case 'pie':
        case 'doughnut':
          return {
            ...defaults,
            cutout: this.type === 'doughnut' ? '70%' : undefined
          };
          
        case 'radar':
          return {
            ...defaults,
            elements: {
              line: {
                tension: 0.1
              }
            }
          };
          
        case 'polarArea':
          return {
            ...defaults
          };
          
        default:
          return defaults;
      }
    }
  },
  
  watch: {
    data: {
      deep: true,
      handler() {
        // Update chart data when it changes
        if (this.chart) {
          this.chart.data = this.data;
          this.chart.update();
        }
      }
    },
    
    options: {
      deep: true,
      handler() {
        // Update chart options when they change
        if (this.chart) {
          this.chart.options = {
            ...this.getDefaultOptions(),
            ...this.options
          };
          this.chart.update();
        }
      }
    },
    
    type() {
      // Recreate chart if type changes
      if (this.chart) {
        this.chart.destroy();
        this.$nextTick(() => {
          this.createChart();
        });
      }
    }
  },
  
  beforeDestroy() {
    // Clean up chart instance
    if (this.chart) {
      this.chart.destroy();
    }
  }
};
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
}
</style>