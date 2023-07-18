#include <cmath>
#include <stdlib.h>
#include <vector>

float sigma(float x) { return 1 / (1 + pow(2.7182, -x)); }

class network {
public:
  float learning_rate = 0.1;

private:
  int layers_number = 0;
  class neuron;
  struct connection {
  public:
    float weight = 0.1;
    neuron *input_neuron;
    connection(neuron *n) {
      input_neuron = n;
      weight = (float)(rand() % 2000) / 1000 - 1;
    }
    float get_value() { return weight * input_neuron->value; }
  };

  struct layer;
  std::vector<layer> layers;

  struct neuron {
    float value, error;
    network *parent_network;
    int id, id_of_layer;
    std::vector<connection> connections;
    neuron(int my_id, int layer_id, network *parent) {
      parent_network = parent;
      id = my_id;
      id_of_layer = layer_id;
    }
    void calc_value() {
      value = 0;
      for (int i = 0; i < connections.size(); i++)
        value += connections[i].get_value();
      value = sigma(value);
    }
    void calc_error() {
      float a = 0;
      for (int n = 0; n < parent_network->layers[id_of_layer + 1].neurons.size(); n++)
        a += parent_network->layers[id_of_layer + 1].neurons[n].error *parent_network->layers[id_of_layer + 1].neurons[n].connections[id].weight;
      error = value * (1 - value) * a;
    }
    void update_weights() {
      for (int c = 0; c < connections.size(); c++)
        connections[c].weight += error * connections[c].input_neuron->value *
                                 parent_network->learning_rate;
    }
    void add_connection(neuron *n) { connections.push_back(connection(n)); }
  };
  struct layer {
    int id;
    std::vector<neuron> neurons;
    layer(int n, int layer_id, network *parent) {
      for (int i = 0; i < n; i++)
        neurons.push_back(neuron(i, layer_id, parent));
      id = layer_id;
    }
  };

  void forward_propagation() {
    for (int l = 1; l < layers.size(); l++) {
      for (int n = 0; n < layers[l].neurons.size(); n++)
        layers[l].neurons[n].calc_value();
    }
  }
  void backward_propagation(std::vector<float> expected) {
    forward_propagation();
    for (int n = 0; n < layers[layers.size() - 1].neurons.size(); n++) {
      float val = layers[layers.size() - 1].neurons[n].value;
      layers[layers.size() - 1].neurons[n].error =
          (expected[n] - val) * val * (1 - val);
    }
    for (int n = 0; n < layers[layers.size() - 1].neurons.size(); n++) {
      for (int c = 0; c < layers[layers.size() - 1].neurons[n].connections.size(); c++)
        layers[layers.size() - 1].neurons[n].connections[c].weight += learning_rate * layers[layers.size() - 1].neurons[n].error * layers[layers.size() - 1].neurons[n].connections[c].input_neuron->value;
    }
    for (int l = layers.size() - 2; l > 0; l--) {
      for (int n = 0; n < layers[l].neurons.size(); n++)
        layers[l].neurons[n].calc_error();
      for (int n = 0; n < layers[l].neurons.size(); n++)
        layers[l].neurons[n].update_weights();
    }
  }
  void set_input_layer(std::vector<float> values) {
    for (int i = 0; i < values.size(); i++)
      layers[0].neurons[i].value = values[i];
  }
  std::vector<float> get_output_layer() {
    std::vector<float> outputs;
    for (int i = 0; i < layers[layers.size() - 1].neurons.size(); i++)
      outputs.push_back(layers[layers.size() - 1].neurons[i].value);
    return outputs;
  }

public:
  void add_layer(int n) { layers.push_back(layer(n, layers_number++, this)); }
  void add_layers(std::vector <int> number_of_layers) {
    for(int i = 0; i < number_of_layers.size(); i++)
      add_layer(number_of_layers[i]);
    this->configure_connections();
  }
  void configure_connections() {
    for (int l = 1; l < layers.size(); l++) {
      for (int n = 0; n < layers[l].neurons.size(); n++) {
        for (int prev_n = 0; prev_n < layers[l - 1].neurons.size(); prev_n++)
          layers[l].neurons[n].add_connection(&layers[l - 1].neurons[prev_n]);
      }
    }
  }
  void train(std::vector<float> input, std::vector<float> output) {
    set_input_layer(input);
    backward_propagation(output);
  }
  std::vector<float> predict(std::vector<float> input) {
    set_input_layer(input);
    forward_propagation();
    return get_output_layer();
  }
  std::string get_network_json() {
    std::string result = "[";
    for (int i = 0; i < layers.size(); i++) {
      result += "[";
      for (int j = 0; j < layers[i].neurons.size(); j++) {
        result += "[";
        for (int l = 0; l < layers[i].neurons[j].connections.size(); l++) {
          result += std::to_string(layers[i].neurons[j].connections[l].weight);
          if (l != layers[i].neurons[j].connections.size() - 1)
            result += ",";
        }
        result += "]";
        if (j != layers[i].neurons.size() - 1)
          result += ",";
      }
      result += "]";
      if (i != layers.size() - 1)
        result += ",";
    }
    result += "]";
    return result;
  }
  std::string get_network_js_var(std::string variable_name = "networkJSON") {
    return variable_name + " = '" + get_network_json() + "';";
  }
};
