#include <iostream>
#include "../../trainer.cpp"
#include <fstream>
using namespace std;

int main() {
    fstream file;
    network myNetwork;
    myNetwork.add_layers({225, 225, 100, 2});
    myNetwork.learning_rate = 0.4;

    vector <vector <float>> inputs;
    vector <vector <float>> outputs;
    vector <float> input = vector <float>(225);
    vector <float> output = vector <float>(2);

    for(int i = 0; i < 220; i++) {
        for(int j = 0; j < 225; j++)
            cin >> input[j];
        inputs.push_back(input);
        for(int j = 0; j < 2; j++)
            cin >> output[j];
        outputs.push_back(output);
    }

    vector <float> predicted;

    for(int i = 0; i < 1000000; i++) {
        for(int j = 0; j < 218; j++)
            myNetwork.train(inputs[j], outputs[j]);

        if(i % 10 == 0) {
            predicted = myNetwork.predict(inputs[218]);
            cout << "\npredicted: " <<  predicted[0] << "\texpected: " << outputs[218][0] << "\tloss: " << abs(outputs[218][0] - predicted[0]);
            cout << "\npredicted: " <<  predicted[1] << "\texpected: " << outputs[218][1] << "\tloss: " << abs(outputs[218][1] - predicted[1]);
            predicted = myNetwork.predict(inputs[219]);
            cout << "\npredicted: " <<  predicted[0] << "\texpected: " << outputs[219][0] << "\tloss: " << abs(outputs[219][0] - predicted[0]);
            cout << "\npredicted: " <<  predicted[1] << "\texpected: " << outputs[219][1] << "\tloss: " << abs(outputs[219][1] - predicted[1]);

        }

        if(i % 100 == 0) {
            file.open("model.js", ios::out);
            file << myNetwork.get_network_js_var() << "\n";
            file.close();
            cout << "\nSAVED\n";
        }        
    }
    return 0;
}