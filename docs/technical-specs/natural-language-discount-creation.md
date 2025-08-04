# Natural Language Discount Creation

This document details a proposed enhancement to enable natural language-based discount creation in Umbraco Commerce, making the powerful discount engine accessible to AI systems.

## Current Problem

Umbraco Commerce has an extremely powerful and flexible discount engine that supports complex combinations of rules and rewards. However, this flexibility creates significant barriers for both AI integration and user experience:

### Complex Configuration Requirements
Each discount requires detailed JSON configuration with nested rules and rewards. Here's a real example of a simple "£10 off specific products" discount:

```json
{
  "store": {
    "alias": "blendid",
    "id": "b1e61994-b83b-420a-903e-63a7a15942dc"
  },
  "alias": "tenOffEbooks",
  "name": "20% off Ebooks",
  "blockFurtherDiscounts": true,
  "blockIfPreviousDiscounts": false,
  "isActive": true,
  "startDate": "2025-07-15T09:00:00Z",
  "expiryDate": "2025-07-16T12:00:00Z",
  "status": "Expired",
  "type": "Code",
  "codes": [
    {
      "code": "TEST",
      "id": "940a3337-12be-4420-a2d3-9e8afc651435",
      "isUnlimited": true,
      "usageLimit": 1
    }
  ],
  "rules": {
    "ruleProviderAlias": "groupDiscountRule",
    "settings": {
      "matchType": "Funnel"
    },
    "children": [
      {
        "ruleProviderAlias": "groupDiscountRule",
        "settings": {
          "matchType": "Any"
        },
        "children": [
          {
            "ruleProviderAlias": "orderLineProductDiscountRule",
            "settings": {
              "nodeId": "34dc965f-0ef2-46ef-a43a-10d07b14b98b"
            }
          },
          {
            "ruleProviderAlias": "orderLineProductDiscountRule",
            "settings": {
              "nodeId": "4c4d0aa4-5d5d-4ee1-bca9-357e0a6fbb4a"
            }
          }
        ]
      },
      {
        "ruleProviderAlias": "groupDiscountRule",
        "settings": {
          "matchType": "Any"
        },
        "children": [
          {
            "ruleProviderAlias": "orderLineProductDiscountRule",
            "settings": {
              "nodeId": "932df289-d95a-4fd5-8915-a78f218efec3"
            }
          },
          {
            "ruleProviderAlias": "orderLineProductDiscountRule",
            "settings": {
              "nodeId": "385c4bc0-21e1-4369-9846-c0c9208aba7c"
            }
          }
        ]
      }
    ]
  },
  "rewards": [
    {
      "rewardProviderAlias": "orderAmountDiscountReward",
      "settings": {
        "priceType": "SubtotalPrice",
        "adjustmentType": "Amount",
        "amounts": {
          "30b62176-6a9e-4a51-b2f0-7ce6c80a461a": 10
        },
        "amountsIncludeTax": "1"
      }
    }
  ]
}
```

This complex nested structure demonstrates the challenge: even a simple discount requires understanding of:
- Multiple rule provider types and their settings
- Nested group rules with different match types ("Any", "All", "Funnel")
- Currency-specific amount configurations
- Product node ID references
- Complex boolean logic between rule groups

### Challenges for AI Integration
- **Schema Complexity**: Dozens of different rule and reward types, each with unique configuration schemas
- **Runtime Discovery Problem**: Rules and rewards are pluggable, so the available types are not known until runtime - making static AI documentation impossible
- **Documentation Overhead**: Would require dynamic documentation generation for every rule/reward type and their parameters
- **Error Prone**: AI would frequently generate invalid configurations due to complex interdependencies
- **Impossible Maintenance**: New rule/reward types from third-party packages would be completely undocumented to AI systems

### Challenges for Back-Office Users
- **Steep Learning Curve**: Users must understand the complex rule/reward system and JSON configuration
- **Time-Consuming Setup**: Creating even simple discounts requires multiple steps and technical knowledge
- **Error-Prone Process**: Easy to misconfigure rules leading to unintended discount behavior
- **Intimidating Interface**: Technical complexity can overwhelm non-technical users
- **Unknown Capabilities**: With pluggable rules/rewards, users may not discover all available discount options from installed packages

## Proposed Solution

Implement a natural language discount parser that can interpret human-readable descriptions and automatically generate the appropriate discount configuration. This solution would benefit both AI integrations and back-office users by providing an intuitive, conversational interface for discount creation.

### Benefits for Back-Office Users

**Simplified Discount Creation Flow:**
Instead of navigating complex rule/reward configuration screens, users could simply describe their discount:

1. **Current Flow**: Navigate to Discounts → Create → Select Rule Types → Configure Options → Select Reward Types → Configure Options → Test & Validate
2. **Proposed Flow**: Navigate to Discounts → Create → Enter "20% off everything in September" → Review & Confirm

**Enhanced User Experience:**
- **Natural Communication**: Users describe discounts in plain language as they would to a colleague
- **Reduced Training**: No need to learn technical discount configuration concepts
- **Faster Creation**: Simple discounts created in seconds rather than minutes
- **Error Prevention**: Parser validates and suggests corrections for ambiguous descriptions
- **Discovery**: Users learn about discount capabilities through natural exploration

### API Endpoint

```http
POST /umbraco/commerce/management/api/v1/discounts/parse
Content-Type: application/json

{
  "description": "Create 20% discount to reduce everything store wide in the month of September",
  "storeIdOrAlias": "blendid"
}
```

### Response Format

```json
{
  "success": true,
  "discount": {
    "name": "20% Off September Sale",
    "alias": "september-sale-2024",
    "rules": [
      {
        "alias": "orderDateRange",
        "settings": {
          "startDate": "2024-09-01T00:00:00Z",
          "endDate": "2024-09-30T23:59:59Z"
        }
      }
    ],
    "rewards": [
      {
        "alias": "orderPercentageDiscount",
        "settings": {
          "percentage": 20.0
        }
      }
    ]
  },
  "interpretation": {
    "discount_type": "percentage",
    "amount": 20,
    "scope": "store_wide",
    "time_period": {
      "month": "September",
      "year": 2024
    }
  },
  "confidence": 0.95
}
```

### Error Response

```json
{
  "success": false,
  "error": "Could not parse discount description",
  "suggestions": [
    "Try specifying the discount amount (e.g., '20% off', '£10 off')",
    "Include the scope (e.g., 'store wide', 'on clothing items')",
    "Add time constraints (e.g., 'in September', 'until Christmas')"
  ],
  "confidence": 0.23
}
```

## Supported Discount Patterns

### Percentage Discounts
- "20% off everything"
- "25% discount on all items"
- "Half price on clothing"
- "30% off store wide"

### Fixed Amount Discounts
- "£10 off orders over £50"
- "$5 discount on all products"
- "€20 off everything"

### Free Shipping
- "Free shipping on orders over £50"
- "Free delivery for VIP customers"
- "No shipping charges this weekend"

### Buy X Get Y Offers
- "Buy 2 get 1 free"
- "Buy 3 get 1 half price"
- "Buy one get one free on shoes"

### Customer Segment Targeting
- "20% off for VIP customers"
- "Student discount of 15%"
- "New customer 10% off first order"

### Product Category Targeting
- "25% off all clothing"
- "Half price electronics"
- "20% discount on books and media"

### Time-Based Rules
- "Weekend sale - 30% off"
- "Black Friday 50% off everything"
- "Christmas special until December 25th"
- "January clearance sale"

### Minimum Order Requirements
- "Free shipping over £50"
- "10% off orders above £100"
- "£5 off when you spend £30 or more"

### Complex Combinations
- "Buy 2 items, get 20% off your entire order"
- "Free shipping and 15% off for orders over £75"
- "VIP customers get 25% off electronics this month"

## Implementation Challenges

### Multilingual Support Requirements

A significant challenge for natural language discount parsing is the need to support multilingual requests. Umbraco Commerce is used globally, and users need to describe discounts in their native languages:

**Language-Specific Challenges:**
- **Grammar Variations**: Different languages have varying sentence structures and grammar rules
- **Cultural Discount Patterns**: Discount descriptions vary by culture (e.g., "BOGOF" in UK, "køb 2 få 1" in Denmark, "koop 2 krijg 1" in Netherlands)
- **Currency Expressions**: Different ways of expressing monetary amounts ("£10 off", "10 kr rabat", "€10 korting", "10 Euro Rabatt")
- **Date Formats**: Varying date expressions ("September", "september" (DK/NL), "September" (DE), "Q3", "third quarter")
- **Product Categories**: Local terminology for product types varies significantly

**Examples Across Key Umbraco Markets:**
```
English (UK/US/AU): "20% off everything in September"
Danish (Denmark): "20% rabat på alt i september"
Dutch (Netherlands): "20% korting op alles in september"  
German (Germany/Austria): "20% Rabatt auf alles im September"
Norwegian (Norway): "20% rabatt på alt i september"
Swedish (Sweden): "20% rabatt på allt i september"
```

**Implementation Implications:**
- Parser must detect input language automatically or accept language parameter
- Need language-specific pattern recognition and entity extraction
- Requires comprehensive translation of discount terminology
- Must handle mixed language input (e.g., English interface with local product names)

## Implementation Approaches

### 1. Rule-Based Pattern Matching

Use regex patterns and rule-based parsing to identify discount components:

```csharp
public class DiscountPatternMatcher
{
    private readonly Dictionary<string, DiscountPattern> _patterns = new()
    {
        ["percentage_off"] = new DiscountPattern
        {
            Regex = @"(\d+)%\s+off(?:\s+(.*?))?",
            RuleBuilder = (match) => new PercentageDiscountRule(int.Parse(match.Groups[1].Value))
        },
        ["fixed_amount_off"] = new DiscountPattern
        {
            Regex = @"([£$€]\d+)\s+off(?:\s+(.*?))?",
            RuleBuilder = (match) => new FixedAmountDiscountRule(ParseAmount(match.Groups[1].Value))
        }
    };
}
```

**Multilingual Considerations:**
- Requires separate pattern sets for each supported language
- Complex maintenance as patterns multiply by number of languages
- Difficult to handle cultural variations and slang

### 2. Natural Language Processing (NLP)

Use NLP libraries like spaCy or Azure Cognitive Services:

```csharp
public class NlpDiscountParser
{
    public async Task<ParsedDiscount> ParseAsync(string description)
    {
        var entities = await _nlpService.ExtractEntitiesAsync(description);
        
        var discount = new ParsedDiscount();
        
        foreach (var entity in entities)
        {
            switch (entity.Type)
            {
                case "PERCENT":
                    discount.DiscountType = DiscountType.Percentage;
                    discount.Amount = entity.Value;
                    break;
                case "MONEY":
                    discount.DiscountType = DiscountType.FixedAmount;
                    discount.Amount = entity.Value;
                    break;
                case "DATE":
                    discount.DateRange = ParseDateRange(entity.Value);
                    break;
            }
        }
        
        return discount;
    }
}
```

**Multilingual Considerations:**
- Many NLP libraries support multiple languages out of the box
- Still requires training data in each target language
- Language detection needed for automatic processing
- Cultural context awareness may be limited

### 3. LLM Integration

Leverage existing LLM services for parsing:

```csharp
public class LlmDiscountParser
{
    private const string SystemPrompt = @"
        You are a discount configuration parser. Convert natural language discount descriptions 
        into structured JSON format for an e-commerce system.
        
        Available discount types:
        - Percentage discounts (orderPercentageDiscount)
        - Fixed amount discounts (orderFixedDiscount)
        - Free shipping (freeShippingReward)
        - Buy X Get Y (buyXGetYReward)
        
        Available rules:
        - Date ranges (orderDateRange)
        - Customer segments (customerTagRule)
        - Product categories (productCategoryRule)
        - Order minimums (orderSubtotalRange)
    ";
    
    public async Task<ParsedDiscount> ParseAsync(string description, string language = null)
    {
        var multilingualPrompt = SystemPrompt + 
            "\n\nPlease respond in English JSON format regardless of the input language.";
            
        var response = await _llmClient.CompleteAsync(multilingualPrompt, description);
        return JsonSerializer.Deserialize<ParsedDiscount>(response);
    }
}
```

**Multilingual Considerations:**
- **Best Multilingual Support**: Modern LLMs handle multiple languages naturally
- **Consistent Output**: Can request English JSON output regardless of input language
- **Cultural Awareness**: LLMs understand cultural discount patterns and terminology
- **Cost Considerations**: API calls may be more expensive than local processing
- **Privacy**: May require sending discount descriptions to external services

## Confidence Scoring

Implement confidence scoring to indicate parsing reliability:

```csharp
public class DiscountParserConfidence
{
    public float CalculateConfidence(ParsedDiscount discount, string originalText)
    {
        float confidence = 1.0f;
        
        // Reduce confidence for ambiguous terms
        if (ContainsAmbiguousTerms(originalText))
            confidence *= 0.8f;
            
        // Increase confidence for explicit values
        if (HasExplicitAmount(discount))
            confidence *= 1.1f;
            
        // Reduce confidence for complex combinations
        if (discount.Rules.Count > 3)
            confidence *= 0.9f;
            
        return Math.Min(confidence, 1.0f);
    }
}
```

## Validation and Feedback

### Pre-creation Validation
- Validate parsed configuration against Commerce business rules
- Check for conflicting rules or impossible combinations
- Ensure required fields are present

### User Feedback Loop
- Return parsed interpretation for user confirmation
- Allow refinement of ambiguous terms
- Learn from user corrections to improve parsing

## Integration with MCP Tools

### Simplified Tool Interface

```typescript
const createDiscountTool = {
    name: 'create_discount_from_description',
    description: 'Create a discount using natural language description',
    paramsSchema: z.object({
        storeIdOrAlias: z.string(),
        description: z.string().describe('Natural language description of the discount (e.g., "20% off everything in September")')
    }).shape,
    
    execute: async (args, context) => {
        // Parse natural language description
        const parseResponse = await Discount.parseDescription({
            body: {
                description: args.description,
                storeId: args.storeIdOrAlias
            }
        });
        
        if (!parseResponse.data.success) {
            return createErrorResult(parseResponse.data.error, parseResponse.data.suggestions);
        }
        
        // Create the discount using parsed configuration
        const discount = await Discount.createDiscount({
            body: parseResponse.data.discount,
            headers: { store: args.storeIdOrAlias }
        });
        
        return createJsonResult({
            discount: mapToDiscountSummary(discount.data),
            interpretation: parseResponse.data.interpretation,
            confidence: parseResponse.data.confidence
        });
    }
};
```

### Benefits for AI Integration

1. **Simplified Interface**: AI only needs to construct natural language, not complex JSON
2. **Error Resilience**: Parser can handle variations in phrasing
3. **Extensible**: New discount patterns can be added without changing AI tools
4. **Validation**: Built-in validation prevents invalid discount configurations

### Benefits for Back-Office Integration

1. **Improved Accessibility**: Makes powerful discount features accessible to non-technical users
2. **Faster Workflow**: Dramatically reduces time to create common discount types
3. **Better Adoption**: Users more likely to utilize advanced discount features when they're easy to access
4. **Reduced Support**: Fewer help desk tickets about discount configuration
5. **Enhanced Productivity**: Store managers can focus on strategy rather than technical implementation

## Future Enhancements

### Learning System
- Track successful vs. failed parses
- Learn from user corrections and feedback
- Improve parsing accuracy over time

### Enhanced Multi-language Support
- **Automatic Language Detection**: Detect input language without explicit specification
- **Cultural Discount Patterns**: Support region-specific discount terminology and concepts
- **Localized Product Names**: Handle product categories and names in local languages
- **Mixed Language Input**: Parse descriptions that mix languages (e.g., local product names in English interface)
- **Regional Currency Support**: Understand local currency formats and expressions

### Advanced Pattern Recognition
- Handle more complex discount scenarios
- Support promotional campaign combinations
- Integration with inventory and customer data

### Voice Interface Support
- Optimize for speech-to-text input
- Handle verbal discount descriptions

## Implementation Priority

**Medium-High** - This enhancement provides dual value, though multilingual support adds significant complexity:

1. **AI Integration**: Solves a major usability barrier for AI-driven discount creation
2. **User Experience**: Could revolutionize discount creation in the back-office, making Commerce more accessible to non-technical users

The complexity of the current discount configuration makes this a high-value enhancement that would benefit both AI integration scenarios and everyday Commerce users. This feature could be a significant competitive differentiator, as most e-commerce platforms require technical expertise for advanced discount configuration.

**Phased Implementation Recommendation:**
1. **Phase 1**: English-only support to validate the core concept and technical approach
2. **Phase 2**: Add support for core Umbraco markets (Danish, Dutch, German, Norwegian, Swedish)
3. **Phase 3**: Expand to additional languages based on user demand and global market expansion

The multilingual challenge is significant but manageable, especially with LLM-based approaches that handle multiple languages naturally.

## Success Metrics

### AI Integration Metrics
- **Parsing Accuracy**: Percentage of discount descriptions successfully parsed
- **Error Reduction**: Decrease in invalid discount creation attempts via API
- **API Adoption**: Usage of natural language endpoint vs. traditional discount creation API

### Back-Office User Metrics
- **User Adoption**: Percentage of users choosing natural language vs. traditional interface
- **Time Savings**: Reduction in time to create common discount types
- **User Satisfaction**: Feedback scores on discount creation experience
- **Feature Utilization**: Increase in usage of advanced discount features
- **Support Tickets**: Reduction in discount-related help requests
- **User Onboarding**: Faster time-to-productivity for new Commerce users