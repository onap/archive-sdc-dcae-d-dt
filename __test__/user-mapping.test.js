var _ = require('underscore');

var input = [];

function monitoringTemplateProtocol(input) {
    var nodeTypes = input;
    if (nodeTypes.length < 2) {
        if (nodeTypes[0] == 'FOI collector' || nodeTypes[0] == 'syslog') {
            return nodeTypes[0];
        } else {
            return 'other';
        }
    } else {
        var match = _.difference(nodeTypes, ["map", "enrich", "supplement"]);
        return match.length > 0 ? 'other' : 'SNMP';
    }
}

beforeEach(() => {
    input = [];
})

test('should return FOI', () => {
    input.push('FOI collector');
    expect(monitoringTemplateProtocol(input)).toBe('FOI collector');
})
test('should return Syslog', () => {
    input.push('syslog');
    expect(monitoringTemplateProtocol(input)).toBe('syslog');
})
test('should return SNMP', () => {
    input.push('map');
    input.push('enrich');
    input.push('supplement');
    input = _.shuffle(input);
    expect(monitoringTemplateProtocol(input)).toBe('SNMP');
})
test('should return other', () => {
    input.push('west');
    expect(monitoringTemplateProtocol(input)).toBe('other');
})
