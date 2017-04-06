A problem that arises in some applications, mainly in data intensive ones, is how to properly keep track of distinct elements in a finite set (e.g.: keeping track of unique visitors on a website or generating KPIs from realtime data) and is of particular importance in database systems.

A naive approach would be to store each distinct element in a collection and then check the total amount of stored elements. Of course this approach is far from optimal since we are dependent on the actual size of our elements, meaning that we might have a problem since we might require infinite space to store all of our info.

A good solution for this problem would be to introduce a step before we store our distinct elements, that would allow us to keep an uniform representation of each element - we can achieve that by creating a hash and then store the hash and value pair in a collection.

Such an example of this approach is the usage of an HashSet, where we keep a copy of each distinct value, indexed by an hash usually derived from the actual element.
The typical HashSet implementation uses [Linear Probing][1] for the cases where a hash collision might occur but the actual value to store isn't equal to the one already stored.

With this approach not only are we able to track the total of distinct elements (i.e.: the set cardinality) but we're also able to easily test if a given member has been observed before.

Nevertheless...

##### We have a space problem

![](http://68.media.tumblr.com/tumblr_mbj1z8XQBI1rxdkjwo1_500.gif)

If we want to store a gigantic amount of elements, we'll have a gigantic need for space soon enough or we'll eventually run out of available space - all because if we want to get an exact cardinality count of a set of elements, we need linear space.

_So what happens if you can't fit all the elements in memory? You're out of luck... (or are you?)_

<sub>Spoiler: It's possible if you can sacrifice some accuracy</sub>

##### Probabilistic counting

Let's imagine that you told me that you flipped a coin and as a result of it your longest run of heads was 3. Given this I'd say that you probably didn't do that many flips, given that you only achieved 3 heads in a row.
However if you told me that you got heads 20 times in a row, I'd postulate that you probably did a fair amount of coin flips. This assuming a rough split of 50/50 on the possibility of getting either heads or tails.

We can extend the same to the binary representation of numbers and say that:

* 50% of numbers start with a `1`

* 25% of numbers start with a `11`

* 12.5% of numbers start with a `111`

* and so on...


So what's the relevance of all of this?

##### Mathematics to the rescue

<blockquote>
Bit-pattern observables: these are based on certain patterns of bits occurring at the beginning of the (binary) S-values. For instance, observing in the stream S at the beginning of a string a bit-pattern 0<sup>{&rho;-1}</sup>1 is more or less a likely indication that the cardinality n of S is at least 2<sup>&rho;</sup>.
</blockquote>

[From the "HyperLogLog: the analysis of a near-optimal
cardinality estimation algorithm" white paper][2]

What this last excerpt says is that like in the coin toss example from earlier, we are able to infer (within a certain amount of confidence) the cardinality of a set by observing the amount of zeroes in a row at the beginning of the binary representation of a given element.

With this in mind two brilliant mathmaticians, Phillip Flajolet and Nigel Martin [proposed][3] a probabilistic algorithm that would allow to estimate the cardinality of a set. It works as follows:

- Every element in the set is hashed into a binary string of fixed size;

- A bitmap is constructed by performing a bitwise OR with every element in its binary representation;

- The position R<sub>N</sub> of the leftmost zero in the bitmap is used to approximately calculate the cardinality given that it can be obtained by log<sub>2</sub>N and

- A correction factor &phi; is also applied to the calculation and it's value has been deducted to be &phi; = 0.77351.

##### Enter HyperLogLog

[HyperLogLog][2] is an algorithm for the aforementioned count-distinct problem that approximates the number of elements on a set.

The size of an HyperLogLog affects the accuracy of the final count, since it is initialized with a collection of zero filled buckets, that will hold values that will help estimate the number of elements in the set.

If the size of the HyperLogLog is **2<sup>N</sup>** then each time we add a new element, it takes the **N** leftmost bits of the  hashed element and uses that value to index a bucket; it then counts the leftmost zeroes from the remaining bits of the hash and stores that result in that same bucket.
In case we already had a value in that bucket, the greatest value (between the new and older values) is stored instead.

The cardinality is given by the following expression, given that **N > 6**:

<img src="https://latex.codecogs.com/png.latex?\inline&space;Count&space;=&space;\frac{0.7213}{1&space;&plus;&space;(\frac{1.079}{2^{N}})}" title="Count = \frac{0.7213}{1 + (\frac{1.079}{2^{N}})}" />

If we still have buckets that haven't been filled and still have a zero value, we count those (let's call it **Z**) and we get the following expression:

<img src="https://latex.codecogs.com/png.latex?\inline&space;Count&space;=&space;2^{N}\log\frac{2^{N}}{Z}" title="Count = 2^{N}\log\frac{2^{N}}{Z}" />

But we're not there yet, since if **Count < 5 * 2<sup>N</sup>** we still need to go through a bias correction step, using values that have been [empirically derived][4]. If the former condition isn't true, then we can just output the value of **Count**.

The relative error of an HyperLogLog has been observed to be <img src="https://latex.codecogs.com/png.latex?\inline&space;\frac{1.04}{\sqrt{N}}" title="\frac{1.04}{\sqrt{N}}"  />

So for an HyperLogLog of size 2<sup>20</sup>, it will occupy 1MB of memory and we'll have a relative error of 0.233%.

##### Implementation

A notable implementation of the HyperLogLog algorithm can be seen in [Redis][5], since it works quite well, while maintaining a small memory footprint.

[This module][6] is a fork from a module by Optimizely, that has some issues fixed, namely it now run on the latest and stable versions of Node.js.

##### Testing it

###### Data sources

For these tests I'm using some old logs from a NASA web server that are available [here][1] and [here][2].

Each line contains a logged request with the following format:

```
n868740.ksc.nasa.gov - - [01/Aug/1995:12:19:45 -0400] "GET /images/MOSAIC-logosmall.gif HTTP/1.0" 200 363
```

We'll be using the request path as the unique key of this set.

###### Getting a precise count

To get a precise count of the unique requests present in the data source I'm using the following:

```sh
$ cat corpus/access_log_Jul95 | egrep -o "\"GET .*?\"" | sort -u | wc -l
```

Which will output the value **22165** and (on my machine) takes around 8 seconds to execute.

###### Getting an estimate using HyperLogLog

For this I'm using an HyperLogLog with 2<sup>16</sup> bytes, reading the corpus file line by line and matching each request line to the same regular expression seen above.

```javascript
const fs = require('fs')
const readline = require('readline')
const HyperLogLog = require('./hyperloglog/hyperloglog')

const hash = HyperLogLog.hash
const hll = new HyperLogLog(16)

const ins = fs.createReadStream('./corpus/access_log_Jul95')
const out = fs.createWriteStream('/dev/null')
const rl = readline.createInterface(ins, out)

rl.on('line', line => {
  var req = /"(GET .*?)\"/.exec(line)
  if (req && req.length === 2) {
    hll.add(hash(req[1]))
  }
})

rl.on('close', () => {
  console.log('Count: ', hll.count())
  console.log('Relative Error: ', hll.relativeError() * 100, '%')
})
```

In the end I get the count and relative error:

```sh
Count: 22144
Relative Error: 0.40625%
```

So we achieved a real error of 0.094%, while only using 64KB of storage.

If we were using a HashSet, using 128-bit hashes, the above set would need at least (128 * 22165) bytes (~355KB).

This might not seem much, but we're working with a really small set of values and the difference in memory usage is already 5.5x greater.

[1]: http://www.cs.rmit.edu.au/online/blackboard/chapter/05/documents/contribute/chapter/05/linear-probing.html

[2]: http://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf

[3]: http://algo.inria.fr/flajolet/Publications/FlMa85.pdf

[4]: http://static.googleusercontent.com/media/research.google.com/en/us/pubs/archive/40671.pdf

[5]: http://antirez.com/news/75

[6]: https://github.com/foliveira/hyperloglog

[7]: http://ita.ee.lbl.gov/html/contrib/NASA-HTTP.html

[8]: http://ita.ee.lbl.gov/html/contrib/Calgary-HTTP.html
