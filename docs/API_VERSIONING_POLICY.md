# API Versioning & Deprecation Policy

## Overview
The FXQL Parser API follows semantic versioning principles to ensure backward compatibility and smooth upgrades for API consumers.

## Version Format
- **Format:** `/v{MAJOR}`
- **Current Version:** `v1`
- **Example:** `POST /v1/fxql-statements`

## Versioning Strategy

### Major Versions
- Incremented for breaking changes
- Examples of breaking changes:
  - Removal of endpoints or parameters
  - Changes to response structure
  - Changes to authentication mechanisms
  - Fundamental changes to business logic

### Minor Updates (within same major version)
- Backward-compatible additions:
  - New optional query parameters
  - New response fields
  - New endpoints
  - Performance improvements

## Deprecation Process

### Timeline
1. **Announcement:** Minimum 6 months before deprecation
2. **Warning Headers:** Deprecated endpoints return `Deprecation` and `Sunset` headers
3. **Documentation:** Clear migration guides published
4. **Support Period:** Minimum 12 months of parallel support for old and new versions
5. **Sunset:** Final removal date clearly communicated

### Deprecation Headers
```http
Deprecation: true
Sunset: Sat, 31 Dec 2025 23:59:59 GMT
Link: <https://docs.example.com/migration/v2>; rel="successor-version"
```

### Migration Support
- Detailed migration guides
- Sample code and examples
- Technical support during transition period
- Automated migration tools where applicable

## Version Support Matrix

| Version | Status     | Release Date | Deprecation Date | Sunset Date |
|---------|-----------|--------------|------------------|-------------|
| v1      | Current   | 2025-10-18   | TBD              | TBD         |

## Best Practices for Clients

1. **Version Pinning:** Always specify version in API calls
2. **Monitor Headers:** Watch for deprecation warnings
3. **Subscribe:** Join our API announcements mailing list
4. **Test Early:** Test against new versions in staging
5. **Update Promptly:** Migrate before sunset dates

## Breaking vs Non-Breaking Changes

### Breaking Changes (Require New Major Version)
- Removing or renaming fields in responses
- Changing field types
- Removing endpoints
- Changing authentication requirements
- Altering rate limits significantly
- Modifying error response structures

### Non-Breaking Changes (Safe for Same Version)
- Adding new optional request parameters
- Adding new fields to responses
- Adding new endpoints
- Improving performance
- Fixing bugs
- Updating documentation

## Contact
For questions about versioning or migration support:
- Email: api-support@example.com
- Documentation: https://docs.example.com/api/versioning
