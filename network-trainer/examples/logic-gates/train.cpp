#include <iostream>
#include "../../trainer.cpp"
using namespace std;

int main() {
    network myNetwork;
    myNetwork.add_layers({2, 3, 1});
    myNetwork.learning_rate = 0.1;
   
    for(int i = 0; i < 500000; i++) {
        myNetwork.train({0, 0}, {0});
        myNetwork.train({0, 1}, {1});
        myNetwork.train({1, 0}, {1});
        myNetwork.train({1, 1}, {0});
    }

    cout << myNetwork.get_network_js_var("xor_model") << "\n";
    return 0;
}