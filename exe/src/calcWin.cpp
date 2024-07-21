#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <random>
#include <chrono>

using namespace std;

// 乱数出力用
struct Ran
{
    mt19937 mt;

    Ran() : mt(chrono::steady_clock::now().time_since_epoch().count()) {}

    int operator()(int a, int b)
    { // [a, b)
        uniform_int_distribution<int> dist(a, b - 1);
        return dist(mt);
    }

    int operator()(int b)
    { // [0, b)
        return (*this)(0, b);
    }
};

int main(int argc, char *argv[])
{
    // hL, hR, oL, oR, 手番
    // h: CPU(hero)
    // o: プレイヤー(opponent)
    // L, R: left, right
    // 手番: 0だとCPU、1だとプレイヤーの番
    int G[5][5][5][5][2];

    // 必勝パターンの取り込み
    // ディレクトリをstringにいれてそこを参照
    string fileName = "list.txt";
    ifstream inputFile(fileName);

    // 取り込み
    for (int i = 0; i < 5; i++)
    {
        for (int j = 0; j < 5; j++)
        {
            for (int k = 0; k < 5; k++)
            {
                for (int l = 0; l < 5; l++)
                {
                    for (int m = 0; m < 2; m++)
                    {
                        inputFile >> G[i][j][k][l][m];
                    }
                }
            }
        }
    }

    inputFile.close();

    // コマンドライン引数からデータを取り込み
    if (argc != 5)
    {
        cerr << "Usage: calcWin.exe <hL> <hR> <oL> <oR>" << endl;
        return 1;
    }

    int hL = stoi(argv[1]);
    int hR = stoi(argv[2]);
    int oL = stoi(argv[3]);
    int oR = stoi(argv[4]);
    // 実現可能な入力か判定
    if (G[hL][hR][oL][oR][0] == -1 || G[hL][hR][oL][oR][0] == 2)
    {
        cout << -1 << " " << -1;
        return 0;
    }
    // 実現可能な入力として計算
    // {hL, hR, oL, oR}={0, 1, 2, 3}として、動かす手と叩く手を並べて出力
    vector<pair<int, int>> possible(0);

    // 必勝パターンが存在すればそれを返しつつ、なければpossibleに負けないパターンを追加

    // 左手で
    // 相手の左手をたたく
    if (G[hL][hR][(oL + hL) % 5][oR][1] == 1 && hL != 0 && oL != 0)
    {
        cout << 0 << " " << 2 << endl;
        return 0;
    }
    if (G[hL][hR][(oL + hL) % 5][oR][1] != 2 && hL != 0 && oL != 0)
    {
        possible.push_back({0, 2});
    }
    // 相手の右手をたたく
    if (G[hL][hR][oL][(oR + hL) % 5][1] == 1 && hL != 0 && oR != 0)
    {
        cout << 0 << " " << 3 << endl;
        return 0;
    }
    if (G[hL][hR][oL][(oR + hL) % 5][1] != 2 && hL != 0 && oR != 0)
    {
        possible.push_back({0, 3});
    }
    // 自分の右手をたたく
    if (G[hL][(hR + hL) % 5][oL][oR][1] == 1 && hL != 0 && hR != 0)
    {
        cout << 0 << " " << 1 << endl;
        return 0;
    }
    if (G[hL][(hR + hL) % 5][oL][oR][1] != 2 && hL != 0 && hR != 0)
    {
        possible.push_back({0, 1});
    }
    // 右手で
    // 相手の左手をたたく
    if (G[hL][hR][(oL + hR) % 5][oR][1] == 1 && hR != 0 && oL != 0)
    {
        cout << 1 << " " << 2 << endl;
        return 0;
    }
    if (G[hL][hR][(oL + hR) % 5][oR][1] != 2 && hR != 0 && oL != 0)
    {
        possible.push_back({1, 2});
    }
    // 相手の右手をたたく
    if (G[hL][hR][oL][(oR + hR) % 5][1] == 1 && hR != 0 && oR != 0)
    {
        cout << 1 << " " << 3 << endl;
        return 0;
    }
    if (G[hL][hR][oL][(oR + hR) % 5][1] != 2 && hR != 0 && oR != 0)
    {
        possible.push_back({1, 3});
    }
    // 自分の左手をたたく
    if (G[(hL + hR) % 5][hR][oL][oR][1] == 1 && hR != 0 && hL != 0)
    {
        cout << 1 << " " << 0 << endl;
        return 0;
    }
    if (G[(hL + hR) % 5][hR][oL][oR][1] != 2 && hR != 0 && hL != 0)
    {
        possible.push_back({1, 0});
    }
    // 必勝パターンはないので、負けない行動をランダムに返す

    int count = possible.size();
    Ran Random;
    int iter = Random(0, count);
    cout << possible.at(iter).first << " " << possible.at(iter).second << endl;

    return 0;
}