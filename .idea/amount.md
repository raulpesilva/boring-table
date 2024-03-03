plugin = 5
events = 1
data = 1_000_000
columns = 3

1 x plugin
1 x events
data * (columns * plugins + plugins) 
1 x plugin

5 + 1 + (1000000 * ( 3 * 5 + 5 )) + 5 = 20000011 //20_000_011