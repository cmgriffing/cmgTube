/*

              <td id="instructions">
                <h3>Adjusting Sensitivity</h3>
                <table>
                  <thead>
                    <tr>
                      <td colSpan={2}>Noise Gate Settings</td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Close Threshold</td>
                      <td>Idle volume level</td>
                    </tr>
                    <tr>
                      <td>Open Threshold</td>
                      <td>Active volume level</td>
                    </tr>
                    <tr>
                      <td>Hold Time</td>
                      <td>How long to hold before switching back to idle</td>
                    </tr>
                  </tbody>
                </table>
                <br />
                PNGTube will consider your audio sources 'active' if there is
                any sound coming through at all. The volume meters in OBS won't
                show sounds quieter than -60db, so even if you think it's
                silent, most audio devices have some static noise in them. The
                "Adjust Sensitivity" button on the left will open the filter
                panel, and add a noise gate if you don't have one already.
              </td>
*/

import React from "react";
import { Card, Flex } from "@mantine/core";

interface AudioProps {}
export function Audio({}: AudioProps) {
  return (
    <Card>
      <Flex direction="row">
        <Flex>
          <h2>Audio</h2>
        </Flex>
      </Flex>
      Audio BODY
    </Card>
  );
}
