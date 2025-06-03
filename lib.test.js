const lib = require('./lib');


describe('checkKeyword', () => {
    it('return true if any keyword is found in given string', () => {
        expect(lib.checkKeywords(['/copy'], 'body of issue_comment. /copy')).toBe(true);
    });
    it('return false if any keyword is not found', ()=> {
        expect(lib.checkKeywords(['/copy'], 'body of issue_comment.')).toBe(false);
    });
    it('multiple keyword', () => {
        expect(lib.checkKeywords(['/copy', 'COPY'], 'body of issue_comment. copy')).toBe(true);
    });
});

describe('parseKeywordCommand', () => {
    it('should find keyword without assignee or additional content', () => {
        const result = lib.parseKeywordCommand(['/copy'], 'body of issue_comment. /copy');
        expect(result.found).toBe(true);
        expect(result.assignee).toBe(null);
        expect(result.additionalContent).toBe('');
    });

    it('should parse assignee from @ mention', () => {
        const result = lib.parseKeywordCommand(['/copy'], 'body of issue_comment. /copy @username');
        expect(result.found).toBe(true);
        expect(result.assignee).toBe('username');
        expect(result.additionalContent).toBe('');
    });

    it('should parse assignee and additional content', () => {
        const result = lib.parseKeywordCommand(['/copy'], 'body of issue_comment. /copy @username please review this');
        expect(result.found).toBe(true);
        expect(result.assignee).toBe('username');
        expect(result.additionalContent).toBe('please review this');
    });

    it('should parse only additional content without assignee', () => {
        const result = lib.parseKeywordCommand(['/copy'], 'body of issue_comment. /copy this needs urgent attention');
        expect(result.found).toBe(true);
        expect(result.assignee).toBe(null);
        expect(result.additionalContent).toBe('this needs urgent attention');
    });

    it('should handle multiple spaces and trim content properly', () => {
        const result = lib.parseKeywordCommand(['/copy'], 'body of issue_comment. /copy   @username   this has extra spaces  ');
        expect(result.found).toBe(true);
        expect(result.assignee).toBe('username');
        expect(result.additionalContent).toBe('this has extra spaces');
    });

    it('should handle @ at the beginning of additional content', () => {
        const result = lib.parseKeywordCommand(['/copy'], '/copy @johndoe this is important');
        expect(result.found).toBe(true);
        expect(result.assignee).toBe('johndoe');
        expect(result.additionalContent).toBe('this is important');
    });

    it('should handle case insensitive keywords', () => {
        const result = lib.parseKeywordCommand(['/copy'], 'body of issue_comment. /COPY @username');
        expect(result.found).toBe(true);
        expect(result.assignee).toBe('username');
        expect(result.additionalContent).toBe('');
    });

    it('should return false when keyword not found', () => {
        const result = lib.parseKeywordCommand(['/copy'], 'body of issue_comment without keyword');
        expect(result.found).toBe(false);
        expect(result.assignee).toBe(null);
        expect(result.additionalContent).toBe('');
    });

    it('should handle @ followed by content without valid username', () => {
        const result = lib.parseKeywordCommand(['/copy'], '/copy @  additional content here');
        expect(result.found).toBe(true);
        expect(result.assignee).toBe('additional');
        expect(result.additionalContent).toBe('content here');
    });

    it('should handle multiple keywords', () => {
        const result = lib.parseKeywordCommand(['/copy', '/duplicate'], 'Please /duplicate @reviewer this is a test');
        expect(result.found).toBe(true);
        expect(result.assignee).toBe('reviewer');
        expect(result.additionalContent).toBe('this is a test');
    });
});