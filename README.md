# hello-effect
Basic project to test using effect-ts in a composable payments workflow

This is just to scratch the surface of using effect. It only handles 
sync requests though it should be the same for handling Promises too,
just have to change the run command to runPromiseExit. It would be
interesting to see a more complete example but the few hours I spent with
with the package revealed a lot.

I only spent a couple of hours on this so there's a lot of the package
I haven't covered. My aim was to see how easily I could create a basic
logic flow using the package. I was more focused on what could I build
rather than how Effect works, the end result matters more than the tool
to get there.


## My thoughts

What worked well was being able to create dedicated handlers and
functions that could then be composed in a single pipeline. No need for
any temp variables.
I also enjoyed the built in circuit breaker when executing the pipe.
Saving on compute resources and guarnteeing the potential result as
either a success or one of any number of known error states which would
for example make building API responses nice and clean.

My concerns with this approach is firstly how unituitive the effect api
and syntax is. A highly opionated package ensures consistency but also
limits my creativity as a developer. There were a number of ways I tried
to build the pipleine that would normally work and be just as clean but
ultimately the typeing of the package blocked it. If you want effect to
work you have to do everything the effect. It's not easy to just use it
for the bits you want.
The package size is also a concern. It claims to be easily tree
shakeable, which is nice. However having a package that is trying to handle
everything when building an application makes it difficult to find and
do what you want, it makes the documentation unwieldy to understand, and
then it very nearly forces you to do everything with effect (see above
concern) so you end up using the entire package size anyway.
My biggest concern though is being able to maintain and debug an
application written with effect. The majority of the execution time is
spent within effect functions, not my business logic. Having code
running I can't see always makes me uneasy, middy is a clear example as
well. Unfortunately this is part of the cost of running any javascript
code but we can minimise this by choosing not to use packages such as
effect & middy.

Overall I think it's a fine tool that can be used 'effectively'. That said
I wouldn't recommend it to everyone. I would say anyone who plans to use
Effect should be ready to commit fully and understand the tradeoffs they're
making. If you're dealing with highly complex workflows, filled with potential
faults and errors and need a strict style of code to keep everything in line,
Effect might be for you. You're likely already dealing with difficult to
maintain code and the benefits of Effect might outweigh the costs.
If however you are just looking for a way to organise some async code or to
simplify some branching logic in a composable way. I would say Effect has
too many downsides for it to be worth it.

## Usage
To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.1.27. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
