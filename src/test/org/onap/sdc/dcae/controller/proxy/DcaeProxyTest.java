package org.onap.sdc.dcae.controller.proxy;

import org.junit.Test;
import org.mockito.Mockito;

import javax.servlet.http.HttpServletRequest;

import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.when;


//TODO headers and cookies test (API)
public class DcaeProxyTest {

    private static final String BEHOST = "https://host.xxx.yyy:8443";
    private DcaeProxy proxy = new DcaeProxy(BEHOST);
    private final static HttpServletRequest servletRequest = Mockito.mock(HttpServletRequest.class);


    @Test
    public void testRewriteUrlWithQueryParams(){
        String requestUrl = "/dcae/dcaeProxy/someBeApi?%20x=1&y=2";
        String expectedUrl = BEHOST + "/dcae/someBeApi?%20x=1&y=2";
        when(servletRequest.getRequestURI()).thenReturn(requestUrl);
        String target = proxy.rewriteTarget(servletRequest);
        assertTrue(target.equals(expectedUrl));
    }

}
