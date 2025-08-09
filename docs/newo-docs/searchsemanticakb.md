# SearchSemanticAkb

Semantically searches the Active Knowledge Base based on specific parameters and returns the top results.

```
SearchSemanticAkb(  
  context: str | None = None,  
  query: str | None = None,  
  fromPerson: Literal["Agent", "User", "Both"] = "Both",  
  fields: List[str] | None = None,  
  labels: List[str] | None = None,  
  numberTopics: int | None = None,  
  priority: Literal["searchFirst", "filterFirst"] = "filterFirst",  
  scoreThreshold: float | None = None,  
  filterByUserPersonaIds: str  
)
```

*   **fields:** \["id", "personId", "topicId", "topic", "summary", "facts", "confidence", "source", "createdAt", "updatedAt", "labels"\]. You can specify one or several fields separated by commas. This parameter indicates which fields of the topic should be returned. The fields of each found topic are returned in the format:
    *   Id\\nperson\_id\\ntopic\_id\\ntopic\\nsummary\\nfacts\\nconfidence\\nsource\\ncreated\_at\\nupdated\_at\\nlabels\\n\\nId\\nperson\_id\\ntopic\_id\\ntopic\\nsummary\\nfacts\\nconfidence\\nsource\\ncreated\_at\\nupdated\_at\\nlabels…
*   **context:** You can specify a small excerpt of a conversation (for example, obtained using GetMemory). Facts will be extracted from this excerpt for semantic search.
*   **query:** Search query for semantic searching. If both query and context are specified, the search will be conducted based on the facts extracted from the context and the query.
*   **fromPerson:** Literal\["Agent", "User", "Both"\]. Indicates whose topics should be searched.
*   **labels:** Used for filtering. You can specify one or several labels separated by commas.
*   **priority:** Sets the priority for search and filtering. If searchFirst is specified, the semantic search will be conducted first, and then the resulting list of topics will be filtered using the value from the labels parameter. If filterFirst is specified, all topics will be filtered by labels first, and a semantic search will be conducted based on the results of the filtering.
*   **scoreThreshold:** The threshold for discarding search results with a score lower than the specified value (default is 0.3 and ranges from 0 to 1). The smaller the number, the more precise results you will get.
*   **filterByUserPersonaIds:** Filters the results based on Persona IDs and shows only those results.

If persona IDs are explicitly provided from arguments, they will be used. Else, the flow context will be used.

Let's try a fun example by creating an agent that is capable of providing details on three different dog breeds. Of course, this can be adjusted to provide any sort of large information set. We will use embedded instructions with the context in the AKB. You can easily shift the instructions to the AKB as well if you are working with more complex instructions based on the intent of a user.

Create a new agent and flow by going through the steps outlined in the "[Hello World](hello-world.md)" example. Ensure you create a new Sandbox chat connector and add it to your agent's Sandbox chat event.

Create a new skill and copy the following information into the Skill Script:

```
{{#block(hidden=True)}}
{{set(name='agent_', value=GetAgent())}}
{{set(name='user_', value=GetUser())}}
{{set(name='memory', value=GetMemory(count=40, maxLen=20000))}}
{{/block}}

{{#system~}}

You are a dog trainer named {{agent_}} and are known as the Dog Whisperer, talking to User named {{user_}}. Your only purpose is to provide facts on known dog breeds, either golden retriever, jack russel, or pug. Ensure you make known what dog breeds you know about. 

YOUR INSTRUCTION: read the AGENT-USER CONVERSATION and think which INSTRUCTION STEP was not completed yet starting from the top. Reply according to the Instruction Step which were not completed. Move to the next INSTRUCTION STEP only when you have completed it.

Instruction step format: 
(((instruction step description))) 
or 
>>>instruction step description

INSTRUCTION STEPS:

>>>Intro: Introduce yourself and what you do.
>>>Ask: Ask which dog breed they'd like more information about.
>>>Detail: Provide details of the selected dog breed.
>>>End: Ask if they'd like to book a dog training session with you. If they say yes, provide the email dogwhisperer@email.com. If they say no, thank them for their time and let them know they can ask you questions at any time. 

CONSIDER THIS INFORMATION:

Below is a brief description of golden retrievers, jack russels and pugs. However, paraphrase these descriptions.

Golden Retrievers are one of the most popular and beloved dog breeds worldwide, known for their friendly, tolerant attitude and intelligence. They make excellent family pets, service dogs, and companions.

Jack Russell Terriers are energetic, bold, and intelligent dogs known for their small size and fearless nature.

Pugs are small, charming dogs known for their distinctive wrinkled faces and curled tails. 

{{GetState(name='dog_description')}}

EXPLICIT CONSTRAINTS:
- Reply in the language User is speaking. 
- Don't use emojis. 
- Verbosity level: Low verbosity (20 words or less) for a new Instruction step and high verbosity only if User requested details or more info.
- You reply like a human, witty and somewhat cheeky person, very casually. 
- When you write your reply, pay attention to who made the last reply. If you were the last to respond, then write your reply taking into account your last answer, i.e., continue the thought.

AGENT-USER CONVERSATION:
{{memory}}
{{agent_}}:

{{~/system}}

{{#assistant~}}
{{gen(name='RESULT', temperature=0.75)}}
{{~/assistant}}

{{#user~}}
Q: Based on the User's replies, name the dog the User is interested in, just state the dog name. Don't explain. If the dog was not indicated, say "The dog is not defined".
A: {{~/user}}

{{#assistant~}}
{{gen(name='dog', temperature=0.6)}}
{{~/assistant}}

{{#user~}}
{{SetState(name='dog_description', value=SearchSemanticAkb(query=dog, fields=["summary"], numberTopics = 1))}} 
{{~/user}}
```

Add a user state field called "dog\_description." Navigate to the agent's AKB and copy each of the following pieces of information into a topic.

```
Name:
golden retriever

Summary:
Golden Retrievers are one of the most popular and beloved dog breeds worldwide, known for their friendly, tolerant attitude and intelligence. They make excellent family pets, service dogs, and companions. Here's a detailed history and some interesting facts about Golden Retrievers:

### Origin and History:

- **Development**: Golden Retrievers were originally bred in Scotland in the mid-19th century. Dudley Marjoribanks, also known as Lord Tweedmouth, is credited with developing the breed. He aimed to create a dog that was loyal, kind, and skilled in retrieving game from both land and water.

- **Ancestry**: The breed was developed by crossing a now-extinct yellow-colored retriever, the Tweed Water Spaniel (also extinct), with the Irish Setter, Bloodhound, and other breeds. This mix was intended to produce a skilled retrieving dog that could perform in the rainy climate and rugged terrain of the Scottish Highlands.

- **Recognition**: The breed was first exhibited in a British dog show in 1908. The Golden Retriever was officially recognized by The Kennel Club of England in 1911 as "Retriever — Yellow or Golden." Later, it was recognized by the American Kennel Club (AKC) in 1925.

### Characteristics:

- **Appearance**: Golden Retrievers have a dense, water-repellent outer coat with a thick undercoat. While their coats are generally golden in color, shades can vary from light cream to dark gold.

- **Temperament**: They are known for their friendly, gentle, and patient temperament, making them excellent family pets. They are also highly intelligent and trainable, which is why they are frequently used as guide dogs, search-and-rescue dogs, and in other service roles.

- **Size**: Adult males typically weigh between 65-75 pounds (29-34 kg), and females weigh between 55-65 pounds (25-29 kg).

### Health and Lifespan:

- **Lifespan**: Golden Retrievers typically live between 10 to 12 years.

- **Common Health Issues**: They are prone to certain genetic disorders such as hip dysplasia, elbow dysplasia, heart problems, and eye conditions. Cancer rates are also notably high in the breed.

### Interesting Facts:

1. **Versatile Workers**: Aside from their traditional roles in hunting and retrieving, Golden Retrievers excel in a variety of roles including drug detection, therapy work, and competitive events such as obedience and agility trials.

2. **Famous Goldens**: Several Golden Retrievers have gained fame through movies and TV shows, including "Air Bud" and "Comet" from "Full House."

3. **Presidential Pets**: U.S. Presidents Gerald Ford and Ronald Reagan both had Golden Retrievers while in office.

4. **Guinness World Record**: A Golden Retriever named "Augie" holds the record for holding five tennis balls in his mouth at one time.

5. **Intelligent and Trainable**: They rank fourth in Stanley Coren's "The Intelligence of Dogs," being one of the brightest dogs ranked by obedience-command trainability.

Golden Retrievers continue to be one of the most popular dog breeds worldwide due to their versatile nature, friendly disposition, and loyalty. They serve not only as family pets but also as invaluable working dogs, excelling in various roles due to their intelligence, trainability, and friendly nature.

Facts:
- Origin: Scotland, mid-19th century.
- Developer: Lord Tweedmouth.
- Ancestry: Cross of yellow-colored retriever, Tweed Water Spaniel, Irish Setter, Bloodhound.
- First exhibition: 1908 in Britain.
- Recognition: The Kennel Club of England in 1911, American Kennel Club in 1925.
- Appearance: Dense, water-repellent outer coat, light cream to dark gold color.
- Temperament: Friendly, gentle, patient.
- Size: Males 65-75 pounds, females 55-65 pounds.
- Lifespan: 10-12 years.
- Health issues: Hip dysplasia, elbow dysplasia, heart problems, eye conditions, high cancer rates.
- Roles: Hunting, retrieving, guide dogs, search-and-rescue, drug detection, therapy work.
- Famous examples: "Air Bud," "Comet" from "Full House."
- Presidential pets: Gerald Ford, Ronald Reagan.
- Guinness World Record: "Augie" held five tennis balls in mouth.
- Intelligence ranking: Fourth in obedience-command trainability.

Confidence: 100%
  
Source: empty

Labels: empty
```

```
Name:
jack russel

Summary:
Jack Russell Terriers are energetic, bold, and intelligent dogs known for their small size and fearless nature. Here's a concise history and some interesting facts about Jack Russell Terriers:

### Origin and History:

- **Development**: Originally bred in England in the early 19th century by Parson John Russell, aimed at creating a working terrier for fox hunting.
- **Ancestry**: Derived from the now-extinct English White Terrier, crossed with other terriers.
- **Recognition**: Not recognized by the Kennel Club (UK) due to variability until the late 20th century; recognized by the American Kennel Club (AKC) in 2000 under the Parson Russell Terrier name.

### Characteristics:

- **Appearance**: Small, sturdy build, predominantly white coat with black, brown, or tan markings.
- **Temperament**: Energetic, fearless, intelligent, and with a strong hunting instinct.
- **Size**: Typically 10-15 inches (25-38 cm) in height and weighing 13-17 pounds (5.9-7.7 kg).

### Health and Lifespan:

- **Lifespan**: Generally live between 13 to 16 years.
- **Common Health Issues**: Prone to certain health problems like patellar luxation, deafness, and eye disorders.

### Interesting Facts:

1. **Hunting Skills**: Bred for hunting, particularly for foxes due to their small size and agility.
2. **Energetic and Playful**: Require lots of exercise and stimulation.
3. **Intelligence**: Highly intelligent, but can be stubborn, making training a necessity from a young age.
4. **Famous Jack Russells**: Notable in film and television, such as "Milo" in "The Mask" and "Eddie" from "Frasier".
5. **Variability**: Comes in different sizes and coat types, including smooth, rough, and broken (a mix of smooth and rough).

Jack Russell Terriers are known for their boundless energy, intelligence, and fearless nature, making them popular pets for those who can provide them with ample exercise and engagement.

Facts:
Here are the main facts about Jack Russell Terriers summarized in bullet points:
### Origin and History:
- Bred in England in the early 19th century.
- Developed by Parson John Russell for fox hunting.
- Recognized by the AKC in 2000 as Parson Russell Terrier.
### Characteristics:
- Small, sturdy build; white with black, brown, or tan markings.
- Energetic, fearless, intelligent, strong hunting instinct.
- Height: 10-15 inches; Weight: 13-17 pounds.
### Health and Lifespan:
- Lifespan: 13 to 16 years.
- Prone to patellar luxation, deafness, and eye disorders.
### Interesting Facts:
- Requires lots of exercise and stimulation.
- Known for intelligence but can be stubborn.
- Notable in media: "Milo" in "The Mask," "Eddie" in "Frasier."
- Comes in smooth, rough, and broken coat types.

Confidence: 100%
  
Source: empty

Labels: empty
```

```
Name:
pug

Summary:
Pugs are small, charming dogs known for their distinctive wrinkled faces and curled tails. Here is a detailed history and some interesting facts about Pugs:

### Origin and History:

- **Development**: Originated in China, dating back to the Han dynasty (B.C. 206 to A.D. 200). They were bred to sit on the laps of Chinese emperors and members of the royal family.
- **Ancestry**: Part of the toy group, they are believed to be related to the Tibetan Mastiff. They were prized by Chinese emperors and often kept in luxury.
- **Spread to Europe**: Pugs were brought from China to Europe in the 16th century and became popular among European royalty.
- **Recognition**: Recognized as a breed in Europe and America since the 19th century. They are now recognized by all major kennel clubs.

### Characteristics:

- **Appearance**: Compact, muscular dogs with a wrinkled, short-muzzled face, and curled tail. Their coat is fine, smooth, and usually comes in shades of fawn or black.
- **Temperament**: Known for their friendly and affectionate nature. They are sociable, gentle, and playful, making them great companions.
- **Size**: Typically weigh between 14-18 pounds (6.4-8.2 kg) and stand about 10-13 inches (25-33 cm) tall at the shoulder.

### Health and Lifespan:

- **Lifespan**: Generally live between 12 to 15 years.
- **Common Health Issues**: Prone to certain health issues such as brachycephalic syndrome, obesity, and skin infections. They can also suffer from eye problems due to their prominent eyes.

### Interesting Facts:

1. **Symbol of Wealth**: In ancient China, owning a Pug was a symbol of wealth and high social status.
2. **Royal Favourites**: They were popular among European royalty, including Queen Victoria of England.
3. **Art and Culture**: Pugs have been featured in art, literature, and film throughout history.
4. **Unique Sounds**: Known for their distinctive snoring and grunting sounds.
5. **Companion Dogs**: Excellent companion dogs, they are known for their loyal and loving nature towards their owners.

Pugs have maintained their status as beloved companions through centuries, cherished for their amiable nature and distinctive appearance. They remain popular pets for individuals and families, offering affection and entertainment to their human companions.

Facts:
Pugs are a unique and charming breed known for their distinctive appearance and loving nature. Here are the main facts about Pugs summarized in bullet points:
### Origin and History:
- Originated in China, dating back to the Han dynasty (B.C. 206 to A.D. 200).
- Bred as lap dogs for Chinese royalty.
- Introduced to Europe in the 16th century and became popular among European royalty.
### Characteristics:
- Distinctive features: Wrinkled, short-muzzled face, and curled tail.
- Friendly, sociable, and affectionate temperament.
- Compact, square body; typically 10-13 inches tall and weighs 14-18 pounds.
### Health and Lifespan:
- Lifespan: 12 to 15 years.
- Prone to health issues such as breathing problems, obesity, and eye conditions due to their brachycephalic nature.
### Interesting Facts:
- Known for their expressive, human-like facial expressions.
- Require minimal exercise but need regular cleaning of facial wrinkles.
- Sensitive to extreme temperatures, both hot and cold.
- Featured in many works of art and owned by several historical figures.

Confidence: 100%
  
Source: empty

Labels: empty
```

Click **Save and Publish**. Create a new user and actor and start chatting with your knowledgeable dog whisperer. The second Q&A user and assistant block allows for a dog breed to be identified when stated by a user. The dog breed is added to the local variable 'dog.' This variable is used as a search query to extract information about this dog breed in the AKB.

Feel free to add more instructions to the skill script and more dog breeds to the AKB. Alternatively, change the context entirely to something that relates to your needs.

Updated 4 months ago

* * *
